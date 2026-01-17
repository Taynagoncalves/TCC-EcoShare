function abrirAdicionarDoacao() {
  window.location.href = '/adicionar-doacao';
}

// Mock temporário (depois vem do banco)
const lista = document.getElementById('listaPublicacoes');

function adicionarCard() {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <img src="../imagens/placeholder.png">
    <p><strong>Material</strong></p>
    <button onclick="verDetalhes()">Ver Mais</button>
  `;

  lista.appendChild(card);
}

function verDetalhes() {
  window.location.href = '/detalhes-doacao';
}
