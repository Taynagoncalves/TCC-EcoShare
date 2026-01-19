
function abrirModalDoacao() {
  document.getElementById('modalDoacao').style.display = 'flex';
}

function fecharModalDoacao() {
  document.getElementById('modalDoacao').style.display = 'none';
}

function irParaAdicionarDoacao() {
  window.location.href = '/adicionar-doacao';
}

function irParaMinhasDoacoes() {
  window.location.href = '/minhas-publicacoes';
}

function deslogar() {
  fetch('/logout', { method: 'POST' })
    .then(() => window.location.href = '/login');
}


/* LISTAR DOAÇÕES NA HOME */
async function carregarDoacoes() {
  try {
    const res = await fetch('/doacoes');
    const doacoes = await res.json();

    const lista = document.getElementById('listaPublicacoes');
    lista.innerHTML = '';

    if (!doacoes || doacoes.length === 0) {
      lista.innerHTML = '<p>Nenhuma doação cadastrada.</p>';
      return;
    }

    doacoes.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <img src="/uploads/${d.imagem}" alt="Imagem da doação">
        <h3>${d.nome_material}</h3>
        <p><strong>Bairro:</strong> ${d.bairro}</p>
        <p><strong>Material:</strong> ${d.tipo_material}</p>
        <p><strong>Quantidade:</strong> ${d.quantidade}</p>
        <button onclick="verDetalhes(${d.id})">Ver mais</button>
      `;

      lista.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar doações:', error);
  }
}

/*  DETALHES*/
function verDetalhes(id) {
  alert('Detalhes da doação ID: ' + id);
}

/*  INICIALIZAÇÃO*/
document.addEventListener('DOMContentLoaded', () => {
  carregarDoacoes();
});
