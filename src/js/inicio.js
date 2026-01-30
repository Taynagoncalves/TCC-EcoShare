const splash = document.querySelector(".center-container");

const TEMPO_SPLASH = 3000;
const TEMPO_SAIDA = 800;

setTimeout(() => {
  splash.classList.add("exit");

  setTimeout(() => {
    window.location.href = "/login";
  }, TEMPO_SAIDA);

}, TEMPO_SPLASH);
