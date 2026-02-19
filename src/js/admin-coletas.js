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
        <td colspan="7">Nenhum resultado encontrado</td>
      </tr>
    `;
    return;
  }

  lista.forEach(c => {

    let botoes = `
      <button class="btn-exibir" onclick="abrirColeta(${c.id})">
        Exibir
      </button>
    `;

   

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
      <td class="acoes">
        ${botoes}
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
async function abrirColeta(id) {

  try {
    const res = await fetch(`/coletas/admin/${id}`, {
      credentials: 'include'
    });

    if (!res.ok) {
      Swal.fire('Erro', 'Coleta não encontrada', 'error');
      return;
    }

    const c = await res.json();

    Swal.fire({
      title: `Coleta #${c.id}`,
      width: 650,
      confirmButtonColor: '#347142',
      html: `
      <div style="text-align:left;font-size:14px">

        <h3 style="color:#347142">${c.nome_material}</h3>

        <b>Quantidade:</b> ${c.quantidade}<br>
        <b>Status:</b> ${c.status}<br>
        <b>Solicitada em:</b> ${new Date(c.data_solicitacao).toLocaleDateString('pt-BR')}<br><br>

        <hr>

        <b>Doador:</b><br>
        ${c.doador_nome}<br>
        Tel: ${c.doador_tel || 'Não informado'}<br><br>

        <b>Solicitante:</b><br>
        ${c.solicitante_nome}<br>
        Tel: ${c.solicitante_tel || 'Não informado'}<br><br>

        <b>Dias disponíveis:</b><br>
        ${c.dias_semana || 'Não informado'}<br><br>

        <b>Horários:</b><br>
        ${c.horarios || 'Não informado'}<br><br>

        <b>Descrição:</b><br>
        ${c.descricao || 'Sem descrição'}<br><br>

        ${
          c.imagem
          ? `<img src="/uploads/${c.imagem}" style="width:40%;border-radius:12px;margin-top:10px">`
          : ''
        }

      </div>
      `
    });

  } catch (err) {
    console.error(err);
    Swal.fire('Erro', 'Erro ao carregar coleta', 'error');
  }
}
async function alterarStatus(id, novoStatus) {

  const confirm = await Swal.fire({
    title: 'Alterar status?',
    text: `Deseja marcar como "${formatarStatus(novoStatus)}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#347142',
    cancelButtonText: 'Cancelar'
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`/coletas/admin/${id}/status`, {
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

    carregarColetas();

  } catch (err) {
    console.error(err);
    Swal.fire('Erro', 'Não foi possível atualizar', 'error');
  }
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
