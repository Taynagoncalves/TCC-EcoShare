document.addEventListener('DOMContentLoaded', () => {
  const itens = document.querySelectorAll('.menu-item');

  const rotaAtual = window.location.pathname
    .replace('/', '')
    .split('?')[0];

  itens.forEach(item => {
    const rota = item.dataset.rota;

    // marca a aba ativa
    if (rota === rotaAtual) {
      item.classList.add('ativo');
    }

    // animação ao clicar
    item.addEventListener('click', () => {
      itens.forEach(i => i.classList.remove('ativo'));
      item.classList.add('ativo');
    });
  });
});
