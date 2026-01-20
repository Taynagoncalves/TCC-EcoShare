async function carregarNotificacoes() {
  const res = await fetch('/coletas/recebidas');
  const dados = await res.json();

  const sino = document.getElementById('iconeNotificacao');

  if (dados.length > 0) {
    sino.classList.add('ativo');
  }
}
