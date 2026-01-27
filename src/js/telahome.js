/* =========================
   VARIÁVEIS GLOBAIS
========================= */
let todasDoacoes = [];
let filtroAtivo = '';
let doacaoAtualId = null;

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
   LISTAR DOAÇÕES
========================= */

// ===== CONTROLE DO SPINNER =====
function mostrarSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = 'flex';
}

function esconderSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = 'none';
}

async function carregarDoacoes() {
  try {
    mostrarSpinner();

    const res = await fetch('/doacoes');
    const dados = await res.json();

    todasDoacoes = dados; // 🔴 ESSENCIAL
    renderizarDoacoes(dados);

  } catch (err) {
    console.error('Erro ao carregar doações:', err);
  } finally {
    esconderSpinner();
  }
}

function renderizarDoacoes(doacoes) {
  const lista = document.getElementById('listaPublicacoes');
  if (!lista) return; // 🔒 PROTEÇÃO ESSENCIAL

  lista.innerHTML = '';

  doacoes.forEach(d => {
    lista.innerHTML += `
      <div class="card-doacao">
        <h3>${d.nome_material}</h3>
        <p>${d.descricao}</p>
      </div>
    `;
  });
}

document.addEventListener('DOMContentLoaded', carregarDoacoes);

/* =========================
   RENDERIZAR DOAÇÕES
========================= */
function renderizarDoacoes(doacoes) {
  const lista = document.getElementById('listaPublicacoes');
  lista.innerHTML = '';

  if (!doacoes || doacoes.length === 0) {
    lista.innerHTML = '<p>Nenhuma doação encontrada.</p>';
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
}

/* busca sem numeros*/
let debounceBusca;

document.addEventListener('DOMContentLoaded', () => {
  const campoBusca = document.getElementById('campoBusca');

  if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
      let valor = e.target.value;

      //remove números
      valor = valor.replace(/[0-9]/g, '');
      e.target.value = valor;

      clearTimeout(debounceBusca);
      debounceBusca = setTimeout(() => {
        aplicarFiltros();
      }, 300);
    });
  }
});

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}


/* filtros */
function filtrarPorMaterial(material) {
  const filtro = material
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const filtradas = todasDoacoes.filter(d => {
    if (!d.material) return false;

    const materialDoacao = d.material
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return materialDoacao.includes(filtro);
  });

  if (filtradas.length === 0) {
    renderizarDoacoes([]);
  } else {
    renderizarDoacoes(filtradas);
  }
}


function aplicarFiltros() {
  const busca = document
    .getElementById('campoBusca')
    ?.value
    .toLowerCase() || '';

  const filtradas = todasDoacoes.filter(d => {
const nome = normalizarTexto(d.nome_material);
const tipo = normalizarTexto(d.tipo_material);


    const correspondeBusca =
      nome.includes(busca) || tipo.includes(busca);

    const correspondeFiltro =
  !filtroAtivo || tipo.includes(filtroAtivo);


    return correspondeBusca && correspondeFiltro;
  });

  renderizarDoacoes(filtradas);
}

function destacarFiltro(material) {
  document.querySelectorAll('.filtros button').forEach(btn => {
    btn.classList.toggle(
      'ativo',
      normalizarTexto(btn.innerText) === normalizarTexto(material)
    );
  });
}

function limparFiltro() {
  filtroAtivo = '';
  document.getElementById('campoBusca').value = '';
  aplicarFiltros();

  document
    .querySelectorAll('.filtros button')
    .forEach(btn => btn.classList.remove('ativo'));
}

/* ver mais */
async function verDetalhes(id) {
  try {
    doacaoAtualId = id;

    const res = await fetch(`/doacoes/${id}`);
    if (!res.ok) throw new Error();

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
      `Doado por: ${d.usuario || 'Usuário não identificado'}`;

    document.getElementById('detalheDias').innerText =
      ` Dias: ${d.dias_semana || 'Não informado'}`;

    document.getElementById('detalheHorario').innerText =
      ` Horário: ${d.horarios || 'Não informado'}`;

    document.getElementById('detalheDescricao').innerText =
       `Descricao: ${d.descricao || 'Sem descrição'}`;

    document.getElementById('modalDetalhes').style.display = 'flex';

  } catch {
    alert('Não foi possível abrir os detalhes.');
  }
}

function fecharDetalhes() {
  document.getElementById('modalDetalhes').style.display = 'none';
}

function abrirDenuncia() {
  // fecha o modal de detalhes
  document.getElementById('modalDetalhes').style.display = 'none';

  // abre o modal de denúncia
  document.getElementById('modalDenuncia').style.display = 'flex';
}


function fecharDenuncia() {
  document.getElementById('modalDenuncia').style.display = 'none';
  document.getElementById('textoDenuncia').value = '';
}

async function enviarDenuncia() {
  const texto = document.getElementById('textoDenuncia').value.trim();

  if (!texto) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Descreva o motivo da denúncia.',
      confirmButtonText: 'Ok'
    });
    return;
  }

  try {
    const res = await fetch('/denuncia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem: texto,
        doacaoId: doacaoAtualId
      })
    });

    if (!res.ok) throw new Error();

    fecharDenuncia();

    Swal.fire({
      icon: 'success',
      title: 'Denúncia enviada!',
      text: 'Obrigado por ajudar a manter o EcoShare um ambiente seguro e responsável. Nossa equipe irá analisar a denúncia..',
      confirmButtonText: 'Ok'
    });

  } catch {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao enviar denúncia. Tente novamente.',
      confirmButtonText: 'Ok'
    });
  }
}

/* solicitar coleta */
async function solicitarColeta() {
  if (!doacaoAtualId) {
    alert('Erro: doação não identificada.');
    return;
  }

  const res = await fetch('/coletas/solicitar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doacao_id: doacaoAtualId })
  });

  if (!res.ok) {
    const erro = await res.json();
    alert(erro.erro || 'Erro ao solicitar coleta');
    return;
  }

  alert('Solicitação enviada!');
}



async function atualizarPontosTopo() {
  const res = await fetch('/usuarios/pontos');
  const data = await res.json();

  document.getElementById('saldoPontos').innerText =
    `${data.pontos} pts`;
}


document.addEventListener('DOMContentLoaded', () => {
  const botao = document.getElementById('btnNotificacao');
  const menu = document.getElementById('menuNotificacao');
  const lista = document.getElementById('listaNotificacoes');
  const badge = document.getElementById('badgeNotificacoes');

  if (!botao || !menu || !lista || !badge) return;

  botao.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  menu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    menu.classList.add('hidden');
  });

  carregarNotificacoes();

  setInterval(carregarNotificacoes, 10000);

  async function carregarNotificacoes() {
    const res = await fetch('/notificacoes');
    const notificacoes = await res.json();

    lista.innerHTML = '';

    const naoLidas = notificacoes.filter(n => !n.lida);

    if (naoLidas.length > 0) {
      badge.textContent = naoLidas.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    notificacoes.forEach(n => {
      const div = document.createElement('div');
      div.className = 'notificacao-item';
      div.innerHTML = `
        <p>${n.mensagem}</p>
        <small>${new Date(n.criada_em).toLocaleString()}</small>
      `;

      div.onclick = async () => {
        await fetch(`/notificacoes/${n.id}/lida`, { method: 'PUT' });

        if (n.tipo === 'solicitacao') {
          window.location.href = '/solicitacoes-coleta';
        } else if (n.tipo === 'andamento') {
          window.location.href = '/coletas-andamento';
        } else {
          window.location.href = '/historico';
        }
      };

      lista.appendChild(div);
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  carregarNotificacoes();

  // atualiza automaticamente
  setInterval(carregarNotificacoes, 10000);
});

/* =========================
   INICIALIZAÇÃO
========================= */
document.addEventListener('DOMContentLoaded', () => {
  carregarDoacoes();
  carregarNotificacoes();
});


