const splash = document.querySelector(".center-container");

// tempo total na tela
const TEMPO_SPLASH = 3000;

// tempo da animação de saída
const TEMPO_SAIDA = 800;

setTimeout(() => {
  splash.classList.add("exit");

  setTimeout(() => {
    window.location.href = "login.html";
  }, TEMPO_SAIDA);

}, TEMPO_SPLASH);
