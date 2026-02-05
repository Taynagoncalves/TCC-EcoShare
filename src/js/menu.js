const path = window.location.pathname;

document.querySelectorAll('.menu-item').forEach(item => {
  const rota = item.getAttribute('data-rota');

  if (rota && path.includes(rota)) {
    item.classList.add('ativo');
  }
});
