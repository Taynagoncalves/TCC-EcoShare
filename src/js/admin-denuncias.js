async function carregarDenuncias() {
  try {
    const res = await fetch('/denuncias/admin', {
      credentials: 'include'
    });

    const denuncias = await res.json();
    const tbody = document.getElementById('listaDenuncias');

    tbody.innerHTML = '';

    denuncias.forEach(d => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${d.id}</td>
        <td>#${d.doacao_id} - ${d.nome_material}</td>
        <td>${d.motivo}</td>
        <td>${d.denunciante}</td>
        <td>${d.status}</td>
        <td>
          <button onclick="verDoacao(${d.doacao_id})">
            Ver
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro ao carregar denúncias', err);
  }
}

function verDoacao(id) {
  window.location.href = `/telahome?ver=${id}`;
}

document.addEventListener('DOMContentLoaded', carregarDenuncias);
