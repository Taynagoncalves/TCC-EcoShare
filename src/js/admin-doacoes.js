// ==========================
// CARREGAR DOAÇÕES (ADMIN)
// ==========================
async function carregarDoacoes() {
  try {
    const res = await fetch('/doacoes/admin', {
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Erro ao buscar doações');
    }

    const doacoes = await res.json();
    const tbody = document.getElementById('listaDoacoes');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(doacoes) || doacoes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center">
            Nenhuma doação encontrada.
          </td>
        </tr>
      `;
      return;
    }

    doacoes.forEach(d => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${d.id}</td>
        <td>${d.nome_material}</td>
        <td>${d.quantidade}</td>
        <td>${d.usuario_nome}</td>
        <td>${formatarStatus(d.status)}</td>
        <td>
          <button class="btn-remover" onclick="removerDoacao(${d.id})">
            Remover
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro ao carregar doações:', err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível carregar as doações.',
      confirmButtonColor: '#347142'
    });
  }
}

// ==========================
// REMOVER DOAÇÃO (ADMIN)
// ==========================
async function removerDoacao(id) {
  const confirmacao = await Swal.fire({
    title: 'Remover doação?',
    text: 'Esta ação não poderá ser desfeita.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, remover',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c62828',
    cancelButtonColor: '#9e9e9e'
  });

  if (!confirmacao.isConfirmed) return;

  try {
    const res = await fetch(`/doacoes/admin/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao remover doação');
    }

    await Swal.fire({
      icon: 'success',
      title: 'Removida!',
      text: 'A doação foi removida com sucesso.',
      timer: 1800,
      showConfirmButton: false
    });

    carregarDoacoes();

  } catch (err) {
    console.error('Erro ao remover doação:', err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível remover a doação.',
      confirmButtonColor: '#347142'
    });
  }
}

// ==========================
// AUXILIAR
// ==========================
function formatarStatus(status) {
  if (status === 'ativo') return 'Ativa';
  if (status === 'andamento') return 'Em andamento';
  if (status === 'concluido') return 'Concluída';
  return status || '-';
}

// ==========================
// INIT
// ==========================
document.addEventListener('DOMContentLoaded', carregarDoacoes);
