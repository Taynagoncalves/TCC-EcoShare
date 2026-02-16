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
  <td>${d.status}</td>
  

  <td class="acoes">

    <button class="btn-exibir" onclick='abrirDoacao(${JSON.stringify(d)})'>
      Exibir
    </button>

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
// pesquisa doacoes
const campoBuscaDoacoes = document.getElementById('buscaDoacoes');

if (campoBuscaDoacoes) {
  campoBuscaDoacoes.addEventListener('input', () => {
    const termo = campoBuscaDoacoes.value.toLowerCase();
    const linhas = document.querySelectorAll('#listaDoacoes tr');

    linhas.forEach(linha => {
      const texto = linha.innerText.toLowerCase();
      linha.style.display = texto.includes(termo) ? '' : 'none';
    });
  });
}
function abrirDoacao(d) {

  Swal.fire({
    title: `Doação #${d.id}`,
    width: 600,
    confirmButtonColor: '#347142',
    html: `
      <div style="text-align:left;font-size:14px">

        <b>Material:</b><br>${d.nome_material}<br><br>

        <b>Tipo:</b><br>${d.tipo_material || 'Não informado'}<br><br>

        <b>Quantidade:</b><br>${d.quantidade}<br><br>

        <b>Doador:</b><br>${d.usuario_nome}<br><br>

        <b>Status:</b><br>${d.status}<br><br>

        <b>Dias disponíveis:</b><br>${d.dias_semana || 'Não informado'}<br><br>

        <b>Horários:</b><br>${d.horarios || 'Não informado'}<br><br>

        <b>Descrição:</b><br>${d.descricao || 'Sem descrição'}<br><br>

        <hr>

        <b>Imagem:</b><br><br>
        ${
          d.imagem
          ? `<img src="/uploads/${d.imagem}" style="width:40%;border-radius:12px">`
          : 'Sem imagem'
        }

      </div>
    `
  });

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
