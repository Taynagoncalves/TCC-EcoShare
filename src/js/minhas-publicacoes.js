/*CARREGAR MINHAS DOAÇÕES */
async function carregarMinhasDoacoes() {
  try {
    const res = await fetch('/doacoes/minhas-doacoes', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error();

    const doacoes = await res.json();
    const lista = document.getElementById('listaMinhasDoacoes');

    if (!lista) return;

    lista.innerHTML = '';

    if (!doacoes.length) {
      lista.innerHTML = '<p>Você ainda não tem publicações.</p>';
      return;
    }

    doacoes.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <img 
          src="${d.imagem ? `/uploads/${d.imagem}` : '/imagens/sem-imagem.png'}"
          alt="${d.nome_material}"
        >

        <h3>${d.nome_material} - ${d.quantidade} unidades</h3>

        <p class="status ${d.status}">
          ${formatarStatus(d.status)}
        </p>

        <div class="acoes">
          ${renderizarBotoes(d)}
        </div>
      `;

      lista.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao carregar suas publicações',
      confirmButtonColor: '#347142'
    });
  }
}

/* BOTÕES CONDICIONAIS*/
function renderizarBotoes(d) {

  // CONCLUÍDO → APENAS EXCLUIR
  if (d.status === 'concluido' || d.status === 'concluida') {
    return `
      <button class="btn-excluir" onclick="excluirDoacao(${d.id})">
        Excluir
      </button>
    `;
  }

  // ANDAMENTO → VER + EXCLUIR
  if (d.status === 'andamento') {
    return `
      <button onclick="verDetalhes(${d.id})">Ver</button>
      <button class="btn-excluir" onclick="excluirDoacao(${d.id})">
        Excluir
      </button>
    `;
  }

  //ATIVO → VER + EDITAR + EXCLUIR
  return `
    <button onclick="verDetalhes(${d.id})">Ver</button>
    <button onclick="editarDoacao(${d.id})">Editar</button>
    <button class="btn-excluir" onclick="excluirDoacao(${d.id})">
      Excluir
    </button>
  `;
}

/*EXCLUIR DOAÇÃO*/
async function excluirDoacao(id) {
  const confirmar = await Swal.fire({
    title: 'Excluir doação?',
    text: 'Essa ação não pode ser desfeita.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c0392b',
    cancelButtonColor: '#aaa'
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await fetch(`/doacoes/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao excluir');
    }

    Swal.fire({
      icon: 'success',
      title: 'Doação excluída',
      confirmButtonColor: '#347142'
    });

    carregarMinhasDoacoes();

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível excluir a doação',
      confirmButtonColor: '#347142'
    });
  }
}

/* AUXILIARES*/
function formatarStatus(status) {
  if (status === 'ativo') return 'Ativa';
  if (status === 'andamento') return 'Em andamento';
  if (status === 'concluido' || status === 'concluida') return 'Concluído';
  return status;
}

function verDetalhes(id) {
  window.location.href = `/telahome?ver=${id}`;
}

function editarDoacao(id) {
  window.location.href = `/editar-doacao?id=${id}`;
}

/*INIT*/
document.addEventListener('DOMContentLoaded', carregarMinhasDoacoes);
