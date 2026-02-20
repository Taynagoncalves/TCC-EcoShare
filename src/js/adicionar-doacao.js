const params = new URLSearchParams(window.location.search);
const idEdicao = params.get('id'); // pega id da url pra saber se é edição ou criação


/* carrega lista de bairros no select */
async function carregarBairros() {
  try {
    const res = await fetch('/bairros', { credentials: 'include' });
    if (!res.ok) throw new Error();

    const bairros = await res.json();
    const select = document.getElementById('bairroSelect');

    select.innerHTML = '<option value="">Selecione seu bairro</option>';

    // cria option pra cada bairro vindo do banco
    bairros.forEach(bairro => {
      const option = document.createElement('option');
      option.value = bairro.id;
      option.textContent = bairro.nome;
      select.appendChild(option);
    });

  } catch (err) {
    console.error(err);
    Swal.fire('Erro', 'Erro ao carregar bairros', 'error');
  }
}
carregarBairros();


/* preenche o formulário com dados da doação quando estiver editando */
async function carregarEdicao(id) {
  try {
    const res = await fetch(`/doacoes/${id}/editar`, { credentials: 'include' });
    if (!res.ok) return Swal.fire('Erro', 'Doação não encontrada', 'error');

    const d = await res.json();

    // muda título e botão
    document.querySelector('.topo h2').innerText = 'Editar Doação';
    document.querySelector('.btn-publicar').innerText = 'Salvar Alterações';

    // preenche campos
    document.querySelector('[name=nome_material]').value = d.nome_material;
    document.querySelector('[name=quantidade]').value = d.quantidade;
    document.querySelector('[name=tipo_material]').value = d.tipo_material;
    document.querySelector('[name=descricao]').value = d.descricao || '';
    document.querySelector('[name=horarios]').value = d.horarios;

    // espera carregar bairros pra selecionar o correto
    const intervalo = setInterval(() => {
      const select = document.getElementById('bairroSelect');
      if (select.options.length > 1) {
        select.value = d.bairro_id;
        clearInterval(intervalo);
      }
    }, 100);

    // marca dias selecionados
    if (d.dias_semana) {
      d.dias_semana.split(',').forEach(dia => {
        const cb = document.querySelector(`.dias-grid input[value="${dia.trim()}"]`);
        if (cb) cb.checked = true;
      });
    }

    // mostra imagem atual
    if (d.imagem) {
      previewImagem.src = `/uploads/${d.imagem}`;
      previewImagem.style.display = 'block';
    }

  } catch (err) {
    console.error(err);
  }
}
if (idEdicao) carregarEdicao(idEdicao);


/* mostra preview da imagem antes de enviar */
const inputImagem = document.querySelector('input[name="imagem"]');
const previewImagem = document.getElementById('previewImagem');

if (inputImagem) {
  inputImagem.addEventListener('change', () => {
    const file = inputImagem.files[0];
    if (!file) return;

    // bloqueia arquivos que não sejam imagem
    if (!file.type.startsWith('image/')) {
      Swal.fire('Arquivo inválido', 'Envie apenas imagens.', 'error');
      inputImagem.value = '';
      previewImagem.style.display = 'none';
      return;
    }

    // lê imagem e mostra na tela
    const reader = new FileReader();
    reader.onload = () => {
      previewImagem.src = reader.result;
      previewImagem.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
}


/* botão selecionar todos os dias */
const btnTodosDias = document.getElementById('btnTodosDias');

function todosDiasMarcados() {
  const checks = document.querySelectorAll('.dias-grid input[type="checkbox"]');
  return Array.from(checks).every(cb => cb.checked);
}

function atualizarTextoBotao() {
  if (!btnTodosDias) return;
  btnTodosDias.textContent = todosDiasMarcados() ? 'Desmarcar todos' : 'Selecionar todos';
}

if (btnTodosDias) {
  btnTodosDias.addEventListener('click', () => {
    const checks = document.querySelectorAll('.dias-grid input[type="checkbox"]');
    const marcar = !todosDiasMarcados();
    checks.forEach(cb => cb.checked = marcar);
    atualizarTextoBotao();
  });

  document.querySelectorAll('.dias-grid input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', atualizarTextoBotao);
  });

  atualizarTextoBotao();
}


/* envio do formulário criar ou editar */
document.getElementById('formDoacao').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  // valida nome
  const nomeMaterial = formData.get('nome_material');
  if (!nomeMaterial || nomeMaterial.trim().length === 0)
    return Swal.fire('Nome inválido', 'Informe o material.', 'warning');

  formData.set('nome_material', nomeMaterial.trim());

  // junta dias selecionados
  const diasSelecionados = Array.from(
    document.querySelectorAll('.dias-grid input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  if (diasSelecionados.length === 0)
    return Swal.fire('Dias obrigatórios', 'Selecione ao menos um dia.', 'warning');

  formData.set('dias_semana', diasSelecionados.join(', '));

  // valida quantidade
  const quantidade = Number(formData.get('quantidade'));
  if (!quantidade || quantidade <= 0)
    return Swal.fire('Quantidade inválida', 'Informe uma quantidade válida.', 'warning');

  // valida horário
  if (!formData.get('horarios'))
    return Swal.fire('Horário obrigatório', 'Selecione um horário.', 'warning');

  // exige imagem apenas na criação
  if (!idEdicao && !inputImagem.files[0])
    return Swal.fire('Imagem obrigatória', 'Selecione uma imagem.', 'warning');

  try {
    // decide se cria ou atualiza
    const url = idEdicao ? `/doacoes/${idEdicao}` : '/doacoes';
    const method = idEdicao ? 'PUT' : 'POST';

    const res = await fetch(url, { method, body: formData, credentials: 'include' });
    const data = await res.json();

    if (!res.ok) throw new Error(data.erro);

    Swal.fire('Sucesso!', idEdicao ? 'Atualizado!' : 'Publicado!', 'success');

    // volta para minhas publicações
    setTimeout(() => {
      window.location.href = '/minhas-publicacoes';
    }, 1200);

  } catch (err) {
    console.error(err);
    Swal.fire('Erro', 'Erro ao salvar a doação.', 'error');
  }
});