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
