async function carregarDoacoes() {
  const res = await fetch('/api/admin/doacoes');
  const doacoes = await res.json();

  const tbody = document.getElementById('listaDoacoes');
  tbody.innerHTML = '';

  doacoes.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.id}</td>
      <td>${d.nome_material}</td>
      <td>${d.quantidade}</td>
      <td>${d.usuario_nome}</td>
      <td>${d.status}</td>
      <td>
        ${d.status !== 'removida'
          ? `<button onclick="removerDoacao(${d.id})">Remover</button>`
          : '—'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function removerDoacao(id) {
  if (!confirm('Deseja remover esta doação?')) return;

  const res = await fetch(`/api/admin/doacoes/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    carregarDoacoes();
  } else {
    alert('Erro ao remover doação');
  }
}

carregarDoacoes();
