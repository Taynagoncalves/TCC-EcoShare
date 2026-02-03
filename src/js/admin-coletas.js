let coletasOriginais = [];

// ==========================
// CARREGAR COLETAS
// ==========================
async function carregarColetas() {
  try {
    const res = await fetch('/coletas/admin', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Erro ao buscar coletas');

    coletasOriginais = await res.json();
    renderizarTabela(coletasOriginais);

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar coletas');
  }
}

// ==========================
// RENDERIZAR TABELA
// ==========================
function renderizarTabela(lista) {
  const tbody = document.getElementById('listaColetas');
  tbody.innerHTML = '';

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">Nenhum resultado encontrado</td>
      </tr>
    `;
    return;
  }

  lista.forEach(c => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nome_material}</td>
      <td>${c.quantidade}</td>
      <td>${c.doador_nome}</td>
      <td>${c.solicitante_nome}</td>
      <td>
        <span class="status ${c.status}">
          ${formatarStatus(c.status)}
        </span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// BUSCA + FILTRO
// ==========================
function aplicarFiltros() {
  const termo = document.getElementById('busca').value.toLowerCase();
  const status = document.getElementById('filtroStatus').value;

  const filtradas = coletasOriginais.filter(c => {
    const matchBusca =
      c.nome_material.toLowerCase().includes(termo) ||
      String(c.id).includes(termo);

    const matchStatus =
      !status || c.status === status;

    return matchBusca && matchStatus;
  });

  renderizarTabela(filtradas);
}

// ==========================
// STATUS FORMATADO
// ==========================
function formatarStatus(status) {
  if (status === 'pendente') return 'Pendente';
  if (status === 'andamento') return 'Em andamento';
  if (status === 'concluida') return 'Concluída';
  if (status === 'recusada') return 'Recusada';
  return status;
}

// ==========================
// EVENTOS
// ==========================
document.getElementById('busca').addEventListener('input', aplicarFiltros);
document.getElementById('filtroStatus').addEventListener('change', aplicarFiltros);

document.addEventListener('DOMContentLoaded', carregarColetas);
