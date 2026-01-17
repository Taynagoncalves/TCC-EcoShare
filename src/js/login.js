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

// ✅ CORREÇÃO AQUI
function irParaCadastro() {
  window.location.href = "/cadastro";
}

document.getElementById("forgotPassword").addEventListener("click", () => {
  window.location.href = "/esqueci-senha";
});

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target[0].value;
  const senha = e.target[1].value;

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, senha })
  });

  const json = await res.json();

  if (!res.ok) {
    alert(json.error);
    return;
  }

  window.location.href = "/telahome";
});
