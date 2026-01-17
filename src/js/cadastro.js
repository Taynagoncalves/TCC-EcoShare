function toggleSenha(id, icon) {
  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
    icon.src = "../icons/olhoaberto.png";
  } else {
    input.type = "password";
    icon.src = "../icons/olhofechado.png";
  }
}
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    nome: e.target[0].value,
    email: e.target[1].value,
    data_nascimento: e.target[2].value,
    senha: e.target[3].value,
    cep: e.target[5].value,
    endereco: e.target[6].value,
    numero: e.target[7].value,
    complemento: e.target[8].value
  };

  const res = await fetch('http://localhost:3000/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const json = await res.json();
  alert(json.message || json.error);
});
