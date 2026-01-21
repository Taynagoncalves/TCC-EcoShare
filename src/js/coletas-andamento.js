// 🔹 Carrega automaticamente ao abrir a página
document.addEventListener('DOMContentLoaded', carregarColetas);

async function carregarColetas() {
  try {
    const res = await fetch('/coletas/andamento');

    if (!res.ok) {
      throw new Error('Erro ao buscar coletas');
    }

    const dados = await res.json();
    const container = document.getElementById('lista-coletas');
    container.innerHTML = '';

    if (dados.length === 0) {
      container.innerHTML = '<p>Nenhuma coleta em andamento.</p>';
      return;
    }

    dados.forEach(c => {
      if (c.papel === 'doador') {
        container.innerHTML += cardDoador(c);
      } else {
        container.innerHTML += cardSolicitante(c);
      }
    });

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar coletas em andamento');
  }
}

// 🔹 CARD PARA QUEM É DOADOR (imagem 1)
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
          href="https://wa.me/55${telefone}" 
          target="_blank"
          class="btn whatsapp"
        >
          Fale com o Coletor
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
          Cancelar
        </button>
      </div>
    </div>
  `;
}

// 🔹 CARD PARA QUEM É SOLICITANTE (imagem 2)
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
          href="https://wa.me/55${telefone}" 
          target="_blank"
          class="btn whatsapp"
        >
          Fale com o Doador
        </a>
      </div>
    </div>
  `;
}

// 🔹 Concluir coleta (doador)
async function concluirColeta(id) {
  if (!confirm('Deseja concluir esta coleta?')) return;

  const res = await fetch(`/coletas/${id}/concluir`, {
    method: 'PUT'
  });

  if (!res.ok) {
    alert('Erro ao concluir coleta');
    return;
  }

  carregarColetas();
}

// 🔹 Cancelar coleta (doador)
async function cancelarColeta(id) {
  if (!confirm('Deseja cancelar esta coleta?')) return;

  const res = await fetch(`/coletas/${id}/cancelar`, {
    method: 'PUT'
  });

  if (!res.ok) {
    alert('Erro ao cancelar coleta');
    return;
  }

  carregarColetas();
}

// 🔹 Remove caracteres inválidos do telefone (WhatsApp)
function limparTelefone(telefone) {
  if (!telefone) return '';
  return telefone.replace(/\D/g, '');
}
