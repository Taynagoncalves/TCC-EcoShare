// ==========================
// NAVEGAÇÕES
// ==========================
function irParaMinhasPublicacoes() {
  window.location.href = '/minhas-publicacoes';
}

function irParaAdmin() {
  window.location.href = '/admin/lojas';
}

function deslogar() {
  fetch('/logout', { method: 'POST' })
    .then(() => {
      window.location.href = '/login';
    });
}

// ==========================
// CARREGAR USUÁRIO LOGADO
// ==========================
async function carregarUsuario() {
  try {
    const res = await fetch('/usuario/me');

    if (!res.ok) return;

    const usuario = await res.json();

    // 🔥 MOSTRAR ÁREA ADMIN APENAS SE FOR ADMIN
    if (usuario.tipo === 'admin') {
      const areaAdmin = document.getElementById('area-admin');
      if (areaAdmin) {
        areaAdmin.style.display = 'block';
      }
    }

  } catch (err) {
    console.error('Erro ao carregar usuário', err);
  }
}
function irParaAdmin() {
  window.location.href = '/admin';
}

// ==========================
// INIT
// ==========================
carregarUsuario();
