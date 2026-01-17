const form = document.getElementById("formEmail");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // impede reload

  // esconde o formulário
  form.style.display = "none";

  // mostra a mensagem
  mensagem.classList.remove("hidden");

  // após 5 segundos (opcional)
  setTimeout(() => {
    // aqui você pode redirecionar se quiser
    window.location.href = "login.html";
  }, 5000);
});
