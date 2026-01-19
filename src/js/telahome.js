
function abrirModalDoacao() {
  document.getElementById('modalDoacao').style.display = 'flex';
}

function fecharModalDoacao() {
  document.getElementById('modalDoacao').style.display = 'none';
}

function irParaAdicionarDoacao() {
  window.location.href = '/adicionar-doacao';
}

function irParaMinhasDoacoes() {
  window.location.href = '/minhas-publicacoes';
}

function deslogar() {
  fetch('/logout', { method: 'POST' })
    .then(() => window.location.href = '/login');
}


/* LISTAR DOAÇÕES NA HOME */
async function carregarDoacoes() {
  try {
    const res = await fetch('/doacoes');
    const doacoes = await res.json();

    const lista = document.getElementById('listaPublicacoes');
    lista.innerHTML = '';

    if (!doacoes || doacoes.length === 0) {
      lista.innerHTML = '<p>Nenhuma doação cadastrada.</p>';
      return;
    }

    doacoes.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';

card.innerHTML = `
  <div class="card-img-wrapper">
    <img src="/uploads/${d.imagem}" alt="${d.nome_material}">
  </div>

  <div class="card-body">
    <div class="card-header">
      <h3 class="card-title">${d.nome_material}</h3>
      <span class="badge-disponivel">Disponível</span>
    </div>

    <div class="card-info">
      <p><strong>Bairro:</strong> ${d.bairro}</p>
      <p><strong>Material:</strong> ${d.tipo_material}</p>
      <p><strong>Quantidade:</strong> ${d.quantidade}</p>
    </div>

    <button class="btn-ver-mais" onclick="verDetalhes(${d.id})">
      Ver mais
    </button>
  </div>
`;




      lista.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar doações:', error);
  }
}

/*  DETALHES*/
function verDetalhes(id) {
  alert('Detalhes da doação ID: ' + id);
}

/*  INICIALIZAÇÃO*/
document.addEventListener('DOMContentLoaded', () => {
  carregarDoacoes();
});
async function verDetalhes(id) {
  const res = await fetch(`/doacoes/${id}`);
  const d = await res.json();

  document.getElementById('detalheImagem').src = `/uploads/${d.imagem}`;
  document.getElementById('detalheTitulo').innerText =
    `${d.nome_material} - ${d.quantidade} Unidades`;

  document.getElementById('detalheMaterial').innerText =
    `Material: ${d.tipo_material}`;

  document.getElementById('detalheBairro').innerText =
    `Bairro: ${d.bairro}`;

  document.getElementById('detalheUsuario').innerText =
    `👤 ${d.usuario}`;

  document.getElementById('detalheDias').innerText =
    `Dias da semana: ${d.dias_semana}`;

  document.getElementById('detalheHorario').innerText =
    `Horário: ${d.horarios}`;

  document.getElementById('detalheDescricao').innerText =
    `Descrição: ${d.descricao}`;

  document.getElementById('modalDetalhes').style.display = 'flex';
}

function fecharDetalhes() {
  document.getElementById('modalDetalhes').style.display = 'none';
}
function reportarDoacao() {
  alert(
    'Sua denúncia será analisada.\n' +
    'Obrigado por ajudar a manter a plataforma segura.'
  );
}
