/* CARREGAR BAIRROS*/
async function carregarBairros() {
  try {
    const res = await fetch('/bairros');
    const bairros = await res.json();

    const select = document.getElementById('bairroSelect');

    bairros.forEach(bairro => {
      const option = document.createElement('option');
      option.value = bairro.id;
      option.textContent = bairro.nome;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Erro ao carregar bairros', err);
  }
}

carregarBairros();

/*ENVIAR DOAÇÃO */
document.getElementById('formDoacao').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  try {
    const res = await fetch('/doacoes', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.sucesso) {
      alert('Doação cadastrada com sucesso!');
      window.location.href = '/telahome';
    } else {
      alert('Erro ao cadastrar doação');
    }

  } catch (err) {
    console.error(err);
    alert('Erro ao enviar dados');
  }
});
