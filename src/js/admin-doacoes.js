async function carregarDoacoes() {
  try {
  const res = await fetch('/api/admin/doacoes', {
  credentials: 'include'
});
;

    if (!res.ok) {
      console.error('Erro ao buscar doações:', res.status);
      return;
    }

    const doacoes = await res.json();

    const tbody = document.getElementById('listaDoacoes');
    tbody.innerHTML = '';

    if (!Array.isArray(doacoes)) {
      console.error('Resposta inesperada:', doacoes);
      return;
    }

    doacoes.forEach(d => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${d.id}</td>
        <td>${d.nome_material}</td>
        <td>${d.quantidade}</td>
        <td>${d.usuario_nome}</td>
        <td>${d.status || '-'}</td>
        <td>
          <button onclick="removerDoacao(${d.id})">
            Remover
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro ao carregar doações:', err);
  }
}

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
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: data.erro || 'Erro ao remover doação'
      });
      return;
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
      title: 'Erro inesperado',
      text: 'Não foi possível remover a doação.'
    });
  }
}


document.addEventListener('DOMContentLoaded', carregarDoacoes);
