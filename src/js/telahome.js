/* =========================
   MODAL ADICIONAR DOAÇÃO
========================= */
function abrirModalDoacao() {
  document.getElementById('modalDoacao').style.display = 'flex';
}

function fecharModalDoacao() {
  document.getElementById('modalDoacao').style.display = 'none';
}

/* =========================
   NAVEGAÇÃO
========================= */
function irParaAdicionarDoacao() {
  window.location.href = '/adicionar-doacao';
}

function irParaMinhasDoacoes() {
  window.location.href = '/minhas-publicacoes';
}

/* =========================
   LISTAR DOAÇÕES NA HOME
========================= */
async function carregarDoacoes() {
  try {
    const res = await fetch('/doacoes');
    if (!res.ok) throw new Error('Erro ao buscar doações');

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
          <img 
            src="${d.imagem ? `/uploads/${d.imagem}` : '/imagens/sem-imagem.png'}"
            alt="${d.nome_material}"
          >
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

/* =========================
   VER DETALHES (ÚNICA FUNÇÃO)
========================= */
async function verDetalhes(id) {
  try {
    window.doacaoAtualId = id;

    const res = await fetch(`/doacoes/${id}`);
    if (!res.ok) throw new Error('Doação não encontrada');

    const d = await res.json();

    document.getElementById('detalheImagem').src =
      d.imagem ? `/uploads/${d.imagem}` : '/imagens/sem-imagem.png';

    document.getElementById('detalheTitulo').innerText =
      `${d.nome_material} - ${d.quantidade} unidades`;

    document.getElementById('detalheMaterial').innerText =
      `Material: ${d.tipo_material}`;

    document.getElementById('detalheBairro').innerText =
      `Bairro: ${d.bairro || 'Não informado'}`;

    document.getElementById('detalheUsuario').innerText =
      `👤 Doado por: ${d.usuario || 'Usuário não identificado'}`;

    document.getElementById('detalheDias').innerText =
      `📅 Dias: ${d.dias_semana || 'Não informado'}`;

    document.getElementById('detalheHorario').innerText =
      `⏰ Horário: ${d.horarios || 'Não informado'}`;

    document.getElementById('detalheDescricao').innerText =
      d.descricao || 'Sem descrição';

    document.getElementById('modalDetalhes').style.display = 'flex';

  } catch (error) {
    alert('Não foi possível abrir os detalhes desta doação.');
    console.error(error);
  }
}

/* =========================
   FECHAR MODAL DETALHES
========================= */
function fecharDetalhes() {
  const modal = document.getElementById('modalDetalhes');
  if (modal) modal.style.display = 'none';
}

/* =========================
   DENÚNCIA
========================= */
function abrirDenuncia() {
  document.getElementById('modalDenuncia').style.display = 'flex';
}

function fecharDenuncia() {
  document.getElementById('modalDenuncia').style.display = 'none';
  document.getElementById('textoDenuncia').value = '';
}

async function enviarDenuncia() {
  const texto = document.getElementById('textoDenuncia').value.trim();

  if (!texto) {
    alert('Descreva o motivo da denúncia.');
    return;
  }

  try {
    const res = await fetch('/denuncia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem: texto,
        doacaoId: window.doacaoAtualId || null
      })
    });

    if (!res.ok) throw new Error();

    fecharDenuncia();
    alert(
      'Denúncia enviada para análise.\n\n' +
      'Agradecemos por ajudar a manter a EcoShare segura!'
    );
  } catch {
    alert('Erro ao enviar denúncia.');
  }
}
async function solicitarColeta() {
  try {
    const res = await fetch('/coletas/solicitar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doacao_id: window.doacaoAtualId // 🔥 usa o ID salvo
      })
    });

    if (!res.ok) throw new Error();

    alert('Solicitação de coleta enviada com sucesso!');
    fecharDetalhes();

  } catch {
    alert('Erro ao solicitar coleta');
  }
}
/* =========================
   NOTIFICAÇÕES
========================= */
async function carregarNotificacoes() {
  try {
    const res = await fetch('/coletas/recebidas');
    const solicitacoes = await res.json();

    const sino = document.getElementById('iconeNotificacao');

    if (solicitacoes.length > 0) {
      sino.classList.add('tem-notificacao');
    } else {
      sino.classList.remove('tem-notificacao');
    }

  } catch (error) {
    console.error('Erro ao carregar notificações', error);
  }
}

function abrirSolicitacoes() {
  window.location.href = '/solicitacoes-coleta';
}

document.addEventListener('DOMContentLoaded', () => {
  carregarNotificacoes();
});

/* =========================
   INICIALIZAÇÃO
========================= */
document.addEventListener('DOMContentLoaded', carregarDoacoes);
