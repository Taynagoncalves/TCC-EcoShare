// carrega automaticamente ao abrir a página
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
      container.innerHTML +=
        c.papel === 'doador'
          ? cardDoador(c)
          : cardSolicitante(c);
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao carregar coletas em andamento',
      confirmButtonColor: '#347142'
    });
  }
}

//CARD DOADOR
function cardDoador(c) {
  const telefone = limparTelefone(c.solicitante_telefone);

  return `
    <div class="card coleta">
      <img 
        src="${c.imagem ? `/uploads/${c.imagem}` : '/imagens/sem-imagem.png'}"
        alt="Imagem da doação"
      >

      <div class="info">
        <!-- STATUS -->
        <span class="status andamento">🟡 Coleta em andamento</span>

        <!-- TÍTULO -->
        <h4>${c.nome_material} — ${c.quantidade} unidades</h4>

        <!-- INFORMAÇÃO -->
        <p>
          <strong>Quem vai coletar:</strong> ${c.solicitante_nome}
        </p>

        <!-- AÇÕES -->
        <div class="acoes">
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
           Concluir coleta
          </button>

          <button 
            class="btn vermelho"
            onclick="cancelarColeta(${c.solicitacao_id})"
          >
            Cancelar coleta (sem pontos)
          </button>
        </div>
      </div>
    </div>
  `;
}


// CARD — SOLICITANTE

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


// CONCLUIR COLETA (DOADOR)

async function concluirColeta(id) {
  try {
    const res = await fetch(`/coletas/concluir/${id}`, {
      method: 'PUT',
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: data.erro || 'Erro ao concluir coleta'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Coleta concluída!',
      html: `<strong>+${data.pontos} pontos</strong> adicionados à sua conta`,
      timer: 2200,
      showConfirmButton: false
    });

    setTimeout(carregarColetas, 2200);

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro inesperado ao concluir coleta'
    });
  }
}


// CANCELAR COLETA EM ANDAMENTO

async function cancelarColeta(id) {
  const confirmacao = await Swal.fire({
    title: 'Cancelar coleta?',
    html: `
      <p>Esta ação irá cancelar a coleta em andamento.</p>
      <p><strong>⚠️ Nenhum ponto será ganho.</strong></p>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, cancelar coleta',
    cancelButtonText: 'Manter coleta',
    confirmButtonColor: '#d32f2f'
  });

  if (!confirmacao.isConfirmed) return;

  try {
    const res = await fetch(`/coletas/cancelar-andamento/${id}`, {
      method: 'PUT',
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: data.erro || 'Erro ao cancelar coleta'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Coleta cancelada',
      text: 'A coleta foi cancelada e nenhum ponto foi contabilizado.',
      timer: 2000,
      showConfirmButton: false
    });

    carregarColetas();

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro inesperado ao cancelar coleta'
    });
  }
}


// UTILITÁRIOS
function limparTelefone(telefone) {
  if (!telefone) return '';
  return telefone.replace(/\D/g, '');
}

function mensagemWhatsApp(tipo, c) {
  let mensagem = '';

  if (tipo === 'doador') {
    mensagem = `
Olá ${c.solicitante_nome},

Sobre a coleta do material:
${c.nome_material} (${c.quantidade} unidades).

Podemos combinar os detalhes?
`;
  }

  if (tipo === 'solicitante') {
    mensagem = `
Olá ${c.doador_nome},

Estou entrando em contato sobre a coleta do material:
${c.nome_material} (${c.quantidade} unidades).

Fico no aguardo.
`;
  }

  return encodeURIComponent(mensagem.trim());
}
