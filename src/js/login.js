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

function irParaCadastro() {
  window.location.href = "cadastro.html";
}
const forgotPassword = document.getElementById("forgotPassword");

forgotPassword.addEventListener("click", () => {
  window.location.href = "esqueci-senha.html";
});

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target[0].value;
  const senha = e.target[1].value;

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, senha })
  });

  const json = await res.json();

  if (res.ok) {
    window.location.href = 'telahome.html';
  } else {
    alert(json.error);
  }
});
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target[0].value;
  const senha = e.target[1].value;

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, senha })
  });

  const json = await res.json();

  if (res.ok) {
    window.location.href = 'telahome.html';
  } else {
    alert(json.error);
  }
});
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target[0].value;
  const senha = e.target[1].value;

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, senha })
  });

  const json = await res.json();

  if (res.ok) {
    window.location.href = 'telahome.html';
  } else {
    alert(json.error);
  }
});
