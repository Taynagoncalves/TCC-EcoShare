async function carregarMinhasDoacoes() {
  try {
    const res = await fetch('/minhas-doacoes');
    const doacoes = await res.json();

    const lista = document.getElementById('listaMinhasDoacoes');
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
          <button onclick="verDetalhes(${d.id})">Ver</button>
          <button onclick="editarDoacao(${d.id})">Editar</button>
          <button class="btn-excluir" onclick="excluirDoacao(${d.id})">
            Excluir
          </button>
        </div>
      `;

      lista.appendChild(card);
    });

  } catch (err) {
    console.error('Erro ao carregar minhas doações:', err);
  }
}

/* =========================
   EXCLUIR DOAÇÃO
========================= */
async function excluirDoacao(id) {
  const confirmar = confirm(
    'Tem certeza que deseja excluir esta doação?\nEssa ação não pode ser desfeita.'
  );

  if (!confirmar) return;

  try {
    const res = await fetch(`/doacoes/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao excluir');
    }

    alert('Doação excluída com sucesso!');
    carregarMinhasDoacoes();

  } catch (error) {
    console.error(error);
    alert('Erro ao excluir doação.');
  }
}

/* =========================
   AUXILIARES
========================= */
function formatarStatus(status) {
  if (status === 'ativo') return 'Ativo';
  if (status === 'andamento') return 'Em andamento';
  return 'Concluído';
}

function verDetalhes(id) {
  window.location.href = `/telahome?ver=${id}`;
}

function editarDoacao(id) {
  alert('Função editar será implementada futuramente.');
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', carregarMinhasDoacoes);
