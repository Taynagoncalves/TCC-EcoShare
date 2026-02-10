
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

function irParaHistorico() {
  window.location.href = '/historico';
}

function irParaAdmin() {
  window.location.href = '/admin';
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

// =========================
// NOTIFICAÇÕES (TOGGLE)
// =========================
async function carregarPreferenciaNotificacoes() {
  const toggle = document.getElementById('toggle-notificacoes');
  if (!toggle) return;

  try {
    const res = await fetch('/usuarios/me/notificacoes', {
      credentials: 'include'
    });

    if (!res.ok) return;

    const data = await res.json();
    // data = { notificacoes_ativas: true/false }
    toggle.checked = !!data.notificacoes_ativas;
  } catch (err) {
    console.error('erro ao carregar preferencia de notificacoes', err);
  }
}

async function atualizarPreferenciaNotificacoes(ativas) {
  try {
    await fetch('/usuarios/me/notificacoes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ativas: !!ativas })
    });
  } catch (err) {
    console.error('erro ao atualizar preferencia de notificacoes', err);
  }
}

function bindToggleNotificacoes() {
  const toggle = document.getElementById('toggle-notificacoes');
  if (!toggle) return;

  toggle.addEventListener('change', () => {
    atualizarPreferenciaNotificacoes(toggle.checked);
  });
}

// init
document.addEventListener('DOMContentLoaded', () => {
  carregarUsuario();
  carregarPreferenciaNotificacoes();
  bindToggleNotificacoes();
});