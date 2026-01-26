async function carregarUsuarios() {
  const tbody = document.getElementById('listaUsuarios');
  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align:center">Carregando usuários...</td>
    </tr>
  `;

  const res = await fetch('/api/admin/usuarios');
  const usuarios = await res.json();

  tbody.innerHTML = '';

  usuarios.forEach(u => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>${u.tipo}</td>
      <td>${u.pontos ?? 0}</td>
      <td>
        <span class="badge ${u.status}">
          ${u.status}
        </span>
      </td>
      <td class="actions">
        <button class="btn-status" onclick="confirmarStatus(${u.id}, '${u.status}')">
          ${u.status === 'ativo' ? 'Bloquear' : 'Ativar'}
        </button>

        <button class="btn-tipo" onclick="confirmarTipo(${u.id}, '${u.tipo}')">
          ${u.tipo === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* =========================
   ALERTA — STATUS
========================= */
function confirmarStatus(id, statusAtual) {
  const novoStatus = statusAtual === 'ativo' ? 'bloqueado' : 'ativo';

  Swal.fire({
    title: novoStatus === 'bloqueado'
      ? 'Bloquear usuário?'
      : 'Ativar usuário?',
    text: novoStatus === 'bloqueado'
      ? 'O usuário não poderá acessar o sistema.'
      : 'O usuário poderá acessar o sistema novamente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#347142',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await fetch(`/admin/usuarios/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Status atualizado com sucesso.',
        timer: 1500,
        showConfirmButton: false
      });

      carregarUsuarios();
    }
  });
}

/* =========================
   ALERTA — TIPO
========================= */
function confirmarTipo(id, tipoAtual) {
  const novoTipo = tipoAtual === 'admin' ? 'usuario' : 'admin';

  Swal.fire({
    title: 'Alterar permissão?',
    text:
      novoTipo === 'admin'
        ? 'O usuário terá acesso administrativo.'
        : 'O usuário perderá acesso administrativo.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#347142',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await fetch(`/admin/usuarios/${id}/tipo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: novoTipo })
      });

      Swal.fire({
        icon: 'success',
        title: 'Permissão atualizada!',
        timer: 1500,
        showConfirmButton: false
      });

      carregarUsuarios();
    }
  });
}

carregarUsuarios();
