function irParaMinhasPublicacoes() {
  window.location.href = '/minhas-publicacoes';
}

function deslogar() {
  fetch('/logout', { method: 'POST' })
    .then(() => {
      window.location.href = '/login';
    });
}
