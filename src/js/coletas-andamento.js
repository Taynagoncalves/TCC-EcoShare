// 🔹 Carrega automaticamente ao abrir a página
document.addEventListener('DOMContentLoaded', carregarColetas);
async function carregarColetas() {
  try {
    const res = await fetch('/coletas/andamento');
    if (!res.ok) throw new Error();

    const dados = await res.json();
    const container = document.getElementById('lista-coletas');

    if (!container) return;

    container.innerHTML = '';

    if (!dados || dados.length === 0) {
      container.innerHTML = '<p>Nenhuma coleta em andamento.</p>';
      return;
    }

    dados.forEach(c => {
      container.innerHTML += c.papel === 'doador'
        ? cardDoador(c)
        : cardSolicitante(c);
    });

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar coletas');
  }
}

/* =========================
   CARD — DOADOR
========================= */
function cardDoador(c) {
  const telefone = limparTelefone(c.solicitante_telefone);

  return `
    <div class="card coleta">
      <img 
        src="${c.imagem ? `/uploads/${c.imagem}` : '/imagens/sem-imagem.png'}"
        alt="Imagem da doação"
      >

      <div class="info">
        <span class="status">Em andamento</span>
        <h4>${c.nome_material} - ${c.quantidade} unidades</h4>

        <p><strong>Quem vai coletar:</strong> ${c.solicitante_nome}</p>

        <a 
          href="https://wa.me/55${telefone}?text=${mensagemWhatsApp('doador', c)}"
          target="_blank"
          class="btn whatsapp"
        >
          Falar com o Coletor
        </a>

        <button 
          class="btn verde"
          onclick="concluirColeta(${c.solicitacao_id})"
        >
          Concluir Coleta
        </button>

        <button
  class="btn vermelho"
  onclick="cancelarColeta(${c.solicitacao_id})"
>
  Cancelar Solicitação
</button>

      </div>
    </div>
  `;
}

/* =========================
   CARD — SOLICITANTE
========================= */
function cardSolicitante(c) {
  const telefone = limparTelefone(c.doador_telefone);

  return `
    <div class="card coleta">
      <img 
        src="${c.imagem ? `/uploads/${c.imagem}` : '/imagens/sem-imagem.png'}"
        alt="Imagem da doação"
      >

      <div class="info">
        <span class="status">Em andamento</span>
        <h4>${c.nome_material} - ${c.quantidade} unidades</h4>

        <a 
          href="https://wa.me/55${telefone}?text=${mensagemWhatsApp('solicitante', c)}"
          target="_blank"
          class="btn whatsapp"
        >
          Falar com o Doador
        </a>
      </div>
    </div>
  `;
}

/* =========================
   CONCLUIR COLETA (DOADOR)
========================= */
document.addEventListener('DOMContentLoaded', carregarColetas);

async function carregarColetas() {
  try {
    const res = await fetch('/coletas/andamento', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error();

    const dados = await res.json();
    const container = document.getElementById('lista-coletas');
    if (!container) return;

    container.innerHTML = '';

    if (!dados || dados.length === 0) {
      container.innerHTML = '<p>Nenhuma coleta em andamento.</p>';
      return;
    }

    dados.forEach(c => {
      container.innerHTML += c.papel === 'doador'
        ? cardDoador(c)
        : cardSolicitante(c);
    });

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar coletas');
  }
}

async function concluirColeta(idSolicitacao) {
  try {
    const res = await fetch(`/coletas/concluir/${idSolicitacao}`, {
      method: 'PUT',
      credentials: 'include'
    });

    if (!res.ok) {
      const erro = await res.json();
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: erro.erro || 'Erro ao concluir coleta',
        confirmButtonColor: '#347142'
      });
      return;
    }

    const data = await res.json();

    Swal.fire({
      icon: 'success',
      title: 'Parabéns! 🎉',
      html: `<strong>+${data.pontos} pontos</strong> adicionados à sua conta!`,
      timer: 2200,
      showConfirmButton: false
    });

    setTimeout(() => {
      carregarColetas();
    }, 2200);

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro inesperado ao concluir coleta',
      confirmButtonColor: '#347142'
    });
  }
}

/* =========================
   FUNÇÕES AUXILIARES (MANTIDAS)
========================= */

function limparTelefone(telefone) {
  if (!telefone) return '';
  return telefone.replace(/\D/g, '');
}

function mensagemWhatsApp(tipo, c) {
  let msg = '';
  if (tipo === 'doador') {
    msg = `Olá ${c.solicitante_nome}, referente à coleta do material ${c.nome_material}.`;
  } else {
    msg = `Olá ${c.doador_nome}, referente à coleta do material ${c.nome_material}.`;
  }
  return encodeURIComponent(msg);
}





/* =========================
   UTILITÁRIOS
========================= */
function limparTelefone(telefone) {
  if (!telefone) return '';
  return telefone.replace(/\D/g, '');
}

function mensagemWhatsApp(tipo, c) {
  let mensagem = '';
  let nomeDestino = '';

  if (tipo === 'doador') {
    nomeDestino = c.solicitante_nome;
    mensagem = `
Olá, ${nomeDestino}

Sou o responsável pela doação do seguinte material:

Material: ${c.nome_material}
Quantidade: ${c.quantidade} unidades

A coleta foi confirmada e estou disponível para combinarmos os próximos passos.
`;
  }

  if (tipo === 'solicitante') {
    nomeDestino = c.doador_nome;
    mensagem = `
Olá, ${nomeDestino}

Estou entrando em contato a respeito da solicitação de coleta do seguinte material:

Material: ${c.nome_material}
Quantidade: ${c.quantidade} unidades

Fico à disposição para alinharmos os detalhes da retirada.
`;
  }

  return encodeURIComponent(mensagem.trim());
}
async function cancelarColeta(id) {
  if (!confirm('Deseja cancelar esta solicitação?')) return;

  const res = await fetch(`/coletas/cancelar/${id}`, {
    method: 'PUT'
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || 'Erro ao cancelar');
    return;
  }

  alert('Solicitação cancelada');
  carregarColetas();
}
