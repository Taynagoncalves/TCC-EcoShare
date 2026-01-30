
// NAVEGAÇÕES
function irParaMinhasPublicacoes() {
  window.location.href = '/minhas-publicacoes';
}

function irParaAdmin() {
  window.location.href = '/admin/lojas';
}
function irParaCuponsResgatados() {
  window.location.href = '/cupons-resgatados';
}

function deslogar() {
  fetch('/logout', { method: 'POST' })
    .then(() => {
      window.location.href = '/login';
    });
}


// CARREGAR USUÁRIO LOGADO
async function carregarUsuario() {
  try {
    const res = await fetch('/usuarios/me', {
      credentials: 'include'
    });

    if (!res.ok) return;

    const usuario = await res.json();

    // mostrar area admin apenas se for admin
    if (usuario.tipo === 'admin') {
      const areaAdmin = document.getElementById('area-admin');
      if (areaAdmin) {
        areaAdmin.style.display = 'block';
      }
    }

  } catch (err) {
    console.error('erro ao carregar usuario', err);
  }
}

function irParaAdmin() {
  window.location.href = '/admin';
}

// init
document.addEventListener('DOMContentLoaded', carregarUsuario);
