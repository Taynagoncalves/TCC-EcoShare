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
