const form = document.getElementById("formEmail");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;

  await fetch('/esqueci-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  form.style.display = "none";
  mensagem.classList.remove("hidden");
});
