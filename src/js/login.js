// Mostrar / ocultar senha
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

// 🔁 Ir para cadastro
function irParaCadastro() {
  window.location.href = "/cadastro";
}

//  Esqueci minha senha
const forgotPassword = document.getElementById("forgotPassword");
if (forgotPassword) {
  forgotPassword.addEventListener("click", () => {
    window.location.href = "/esqueci-senha";
  });
}

// LOGIN
const formLogin = document.getElementById("formLogin");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = formLogin.email.value.trim();
  const senha = formLogin.senha.value;

  if (!email || !senha) {
    alert("Preencha todos os campos.");
    return;
  }

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, senha })
  });

  const json = await res.json();

  if (!res.ok) {
    alert(json.error || "Email ou senha inválidos.");
    return;
  }

  // Login OK ir para Home
  window.location.href = "/telahome";
});
