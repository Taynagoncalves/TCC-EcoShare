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

// LOGIN
const formLogin = document.getElementById("formLogin");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = formLogin.email.value.trim();
  const senha = formLogin.senha.value;

  if (!email || !senha) {
    Swal.fire({
      icon: "warning",
      title: "Atenção",
      text: "Preencha todos os campos.",
      confirmButtonColor: "#347142"
    });
    return;
  }

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, senha })
  });

  const json = await res.json();

  // 🔒 USUÁRIO BLOQUEADO
  if (res.status === 403 && json.erro === "Usuário bloqueado") {
    Swal.fire({
      icon: "error",
      title: "Conta bloqueada",
      text: "Sua conta foi bloqueada pelo administrador.",
      confirmButtonColor: "#347142"
    });
    return;
  }

  // ❌ ERRO DE LOGIN
  if (!res.ok) {
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: json.erro || "Email ou senha inválidos.",
      confirmButtonColor: "#347142"
    });
    return;
  }

  // ✅ LOGIN OK
  Swal.fire({
    icon: "success",
    title: "Bem-vindo!",
    timer: 1200,
    showConfirmButton: false
  }).then(() => {
    window.location.href = "/telahome";
  });
});
