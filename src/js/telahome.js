// variáveis globais
let todasDoacoes = [];
let filtroAtivo = '';
let doacaoAtualId = null;

// modal adicionar doação
function abrirModalDoacao() {
  document.getElementById('modalDoacao').style.display = 'flex';
}

function fecharModalDoacao() {
  document.getElementById('modalDoacao').style.display = 'none';
}


// navegação
function irParaAdicionarDoacao() {
  window.location.href = '/adicionar-doacao';
}

function irParaMinhasDoacoes() {
  window.location.href = '/minhas-publicacoes';
}

// controle do spinner
function mostrarSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = 'flex';
}

function esconderSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = 'none';
}

// carregar doações
async function carregarDoacoes() {
  try {
    mostrarSpinner();

    const res = await fetch('/doacoes');
    if (!res.ok) throw new Error('erro http');

    const dados = await res.json();
    todasDoacoes = dados;
    renderizarDoacoes(dados);

  } catch (err) {
    console.error('erro ao carregar doações:', err);
  } finally {
    esconderSpinner();
  }
}

// renderizar doações
function renderizarDoacoes(doacoes) {
  const lista = document.getElementById('listaPublicacoes');
  if (!lista) return;

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
          alt="${d.nome_material || d.tipo_material}"
        >
      </div>

      <div class="card-body">
        <div class="card-nome-material">
          ${d.nome_material || d.tipo_material}
        </div>

        <div class="card-info">
          <p><span class="label-verde">Bairro:</span> ${d.bairro}</p>
          <p><span class="label-verde">Material:</span> ${d.tipo_material}</p>
          <p><span class="label-verde">Quantidade:</span> ${d.quantidade}</p>
        </div>
      </div>

      <button class="btn-ver-mais" onclick="verDetalhes(${d.id})">
        Ver mais
      </button>
    `;

    lista.appendChild(card);
  });
}



// busca sem números
let debounceBusca;

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// filtros
function filtrarPorMaterial(material) {
  filtroAtivo = normalizarTexto(material);
  aplicarFiltros();
  destacarFiltro(material);
}

function aplicarFiltros() {
  const busca =
    document.getElementById('campoBusca')?.value.toLowerCase() || '';

  const filtradas = todasDoacoes.filter(d => {
    const nome = normalizarTexto(d.nome_material || '');
    const tipo = normalizarTexto(d.tipo_material || '');

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

// ver detalhes da doação
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
      `material: ${d.tipo_material}`;

    document.getElementById('detalheBairro').innerText =
      `bairro: ${d.bairro || 'não informado'}`;

    document.getElementById('detalheUsuario').innerText =
      `doado por: ${d.usuario || 'usuário não identificado'}`;

    document.getElementById('detalheDias').innerText =
      `dias: ${d.dias_semana || 'não informado'}`;

    document.getElementById('detalheHorario').innerText =
      `horário: ${d.horarios || 'não informado'}`;

    document.getElementById('detalheDescricao').innerText =
      `descrição: ${d.descricao || 'sem descrição'}`;

    document.getElementById('modalDetalhes').style.display = 'flex';

  } catch {
    alert('não foi possível abrir os detalhes.');
  }
}

function fecharDetalhes() {
  document.getElementById('modalDetalhes').style.display = 'none';
}

// denúncia
function abrirDenuncia() {

  // fecha o modal de detalhes e remove foco
  const modal = document.getElementById('modalDetalhes');
  if (modal) modal.style.display = 'none';
  document.activeElement.blur();

  Swal.fire({
    title: 'Reportar publicação',
    width: 520,
    html: `
      <div style="text-align:left">

        <label style="font-weight:600">Categoria</label>
        <select id="categoriaDenuncia" class="swal2-input">
          <option value="">Selecione...</option>
          <option value="spam">Spam</option>
          <option value="ofensivo">Conteúdo ofensivo</option>
          <option value="fake">Informação falsa</option>
          <option value="ilegal">Conteúdo ilegal</option>
        </select>

        <label style="font-weight:600">Descreva o problema</label>
        <textarea id="textoDenuncia"
          class="swal2-textarea"
          placeholder="Explique o motivo da denúncia"></textarea>

      </div>
    `,
    confirmButtonText:'Enviar denúncia',
    confirmButtonColor:'#16a34a',
    showCancelButton:true,
    cancelButtonText:'Cancelar',

    preConfirm: async () => {

  const popup = Swal.getPopup();
  const mensagem = popup.querySelector('#textoDenuncia').value.trim();
  const categoria = popup.querySelector('#categoriaDenuncia').value;

  if (!categoria)
    return Swal.showValidationMessage('Selecione uma categoria');

  if (!mensagem)
    return Swal.showValidationMessage('Descreva o motivo');

  try {

    const res = await fetch('/denuncias', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        mensagem,
        categoria,
        doacao_id: doacaoAtualId
      })
    });

    const data = await res.json();

    if (!res.ok) throw data;

    Swal.fire({
      icon:'success',
      title:'Denúncia enviada',
      text:'Nossa equipe irá analisar em breve'
    });

  } catch (err) {

    Swal.fire({
      icon:'warning',
      title:'Não foi possível enviar',
      text: err.erro || 'erro inesperado'
    });

  }
}

  });
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
      title: 'atenção',
      text: 'descreva o motivo da denúncia.'
    });
    return;
  }

  try {
    const res = await fetch('/denuncias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem: texto,
        doacao_id: doacaoAtualId
      })
    });

    if (!res.ok) throw new Error();

    fecharDenuncia();

    Swal.fire({
      icon: 'success',
      title: 'denúncia enviada',
      text: 'nossa equipe irá analisar a denúncia.'
    });

  } catch {
    Swal.fire({
      icon: 'error',
      title: 'erro',
      text: 'erro ao enviar denúncia.'
    });
  }
}

// solicitar coleta
async function solicitarColeta() {
  if (!doacaoAtualId) {
    fecharDetalhes();

    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Doação não identificada.',
      confirmButtonColor: '#347142'
    });
    return;
  }

  try {
    const res = await fetch('/coletas/solicitar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        doacao_id: doacaoAtualId
      })
    });

    const data = await res.json();

    // erro de regra de negócio (ex: própria doação)
    if (!res.ok) {
      fecharDetalhes();

      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: data.erro || 'Não foi possível solicitar a coleta.',
        confirmButtonColor: '#347142'
      });

      return;
    }

    // sucesso
    fecharDetalhes();

    Swal.fire({
      icon: 'success',
      title: 'Solicitação enviada!',
      text: 'Aguarde a confirmação do doador.',
      confirmButtonColor: '#347142'
    });

  } catch (err) {
    console.error('erro ao solicitar coleta:', err);
    fecharDetalhes();

    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro inesperado ao solicitar a coleta.',
      confirmButtonColor: '#347142'
    });
  }
}



// atualizar pontos do usuário
async function atualizarPontosTopo() {
  const res = await fetch('/usuarios/pontos');
  const data = await res.json();

  document.getElementById('saldoPontos').innerText =
    `${data.pontos} pts`;
}

// notificações
async function carregarNotificacoes() {
  try {
    const lista = document.getElementById('listaNotificacoes');
    const badge = document.getElementById('badgeNotificacoes');

    if (!lista || !badge) return;

    const res = await fetch('/notificacoes', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error();

    const notificacoes = await res.json();
    lista.innerHTML = '';

    const naoLidas = notificacoes.filter(n => !n.lida);

    // badge
    if (naoLidas.length > 0) {
      badge.textContent = naoLidas.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    notificacoes.forEach(n => {

      const div = document.createElement('div');

      // negrito ou não
      div.className = `notificacao-item ${n.lida ? 'lida' : 'nao-lida'}`;

      div.innerHTML = `
        <p>${n.mensagem}</p>
        <small>${new Date(n.criada_em).toLocaleString()}</small>
      `;

      // clique
      div.onclick = async () => {

        // remove negrito visual imediato
        div.classList.remove('nao-lida');
        div.classList.add('lida');

        // marca como lida no banco
        await fetch(`/notificacoes/${n.id}/lida`, { method: 'PUT' });

        // atualiza badge
        carregarNotificacoes();

        // redirecionamento
        let destino = null;

        if (n.tipo === 'solicitacao')
          destino = '/solicitacoes-coleta';

        else if (n.tipo === 'andamento')
          destino = '/coletas-andamento';

        if (destino)
          window.location.href = destino;
      };

      lista.appendChild(div);
    });

  } catch (err) {
    console.error('erro ao carregar notificações:', err);
  }
}


// limpar notificações
async function limparNotificacoes(e) {
  e.stopPropagation();

  try {
    const res = await fetch('/notificacoes/limpar', {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error();

    document.getElementById('listaNotificacoes').innerHTML = '';
    document.getElementById('badgeNotificacoes').classList.add('hidden');

  } catch (err) {
    console.error(err);
    alert('não foi possível limpar as notificações.');
  }
}
async function carregarPreferenciaNotificacoesHome() {
  const status = document.getElementById('statusNotificacoes');
  if (!status) return;


  try {
    const res = await fetch('/usuarios/me/notificacoes', {
      credentials: 'include'
    });
    if (!res.ok) return;


    const data = await res.json();
    const ativas = !!(data.notificacoes_ativas ?? data.ativas);


    status.classList.remove('ligado', 'desligado');


    if (ativas) {
      status.textContent = 'Notificações ligadas';
      status.classList.add('ligado');
    } else {
      status.textContent = 'Notificações desligadas';
      status.classList.add('desligado');
    }
  } catch (e) {}
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarDoacoes();
  carregarFotoTopo();
  carregarNotificacoes();
  carregarPreferenciaNotificacoesHome();

  setInterval(carregarNotificacoes, 10000);

  const campoBusca = document.getElementById('campoBusca');
  if (campoBusca) {
    campoBusca.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/[0-9]/g, '');
      clearTimeout(debounceBusca);
      debounceBusca = setTimeout(aplicarFiltros, 300);
    });
  }

  const botao = document.getElementById('btnNotificacao');
  const menu = document.getElementById('menuNotificacao');

  if (!botao || !menu) return;

  botao.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  menu.addEventListener('click', e => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    if (!menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
    }
  });
});
function capitalizar(texto) {
  return texto
    ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
    : '';
}
async function carregarFotoTopo() {
  try {
    const res = await fetch('/usuarios/me', { credentials: 'include' });
    if (!res.ok) return;

    const usuario = await res.json();

    const foto = document.getElementById('fotoTopo');
    if (!foto) return;

    foto.src = usuario.foto && usuario.foto.trim() !== ''
      ? usuario.foto
      : '/icons/user.png';

  } catch (err) {
    console.error('erro ao carregar foto topo', err);
  }
}
