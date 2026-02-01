async function carregarUsuarios() {
  const tbody = document.getElementById('listaUsuarios');

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align:center">
        Carregando usuários...
      </td>
    </tr>
  `;

  try {
    const res = await fetch('/usuarios/admin', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Erro ao buscar usuários');

    const usuarios = await res.json();
    tbody.innerHTML = '';

    if (!usuarios || usuarios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center">
            Nenhum usuário encontrado.
          </td>
        </tr>
      `;
      return;
    }

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
          <button
            class="btn-status"
            onclick="confirmarStatus(${u.id}, '${u.status}')"
          >
            ${u.status === 'ativo' ? 'Bloquear' : 'Ativar'}
          </button>

          <button
            class="btn-tipo"
            onclick="confirmarTipo(${u.id}, '${u.tipo}')"
          >
            ${u.tipo === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:red">
          Erro ao carregar usuários
        </td>
      </tr>
    `;

    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao carregar usuários',
      confirmButtonColor: '#347142'
    });
  }
}

/* =========================
   ALTERAR STATUS
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
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/usuarios/admin/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: novoStatus })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.erro);

      Swal.fire({
        icon: 'success',
        title: 'Status atualizado!',
        timer: 1400,
        showConfirmButton: false
      });

      carregarUsuarios();

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível atualizar o status',
        confirmButtonColor: '#347142'
      });
    }
  });
}

/* =========================
   ALTERAR TIPO
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
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/usuarios/admin/${id}/tipo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tipo: novoTipo })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.erro);

      Swal.fire({
        icon: 'success',
        title: 'Permissão atualizada!',
        timer: 1400,
        showConfirmButton: false
      });

      carregarUsuarios();

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível alterar a permissão',
        confirmButtonColor: '#347142'
      });
    }
  });
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', carregarUsuarios);
