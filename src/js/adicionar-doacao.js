// ==========================
// DETECTA MODO EDIÇÃO
// ==========================
const params = new URLSearchParams(window.location.search);
const idEdicao = params.get('id');

// ==========================
// CARREGAR BAIRROS
// ==========================
async function carregarBairros() {
  try {
    const res = await fetch('/bairros', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error();

    const bairros = await res.json();
    const select = document.getElementById('bairroSelect');

    select.innerHTML = '<option value="">Selecione seu bairro</option>';

    bairros.forEach(bairro => {
      const option = document.createElement('option');
      option.value = bairro.id;
      option.textContent = bairro.nome;
      select.appendChild(option);
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao carregar bairros',
      confirmButtonColor: '#347142'
    });
  }
}

carregarBairros();

// ==========================
// CARREGAR DOAÇÃO PARA EDIÇÃO
// ==========================
async function carregarEdicao(id) {
  try {
    const res = await fetch(`/doacoes/${id}/editar`, {
      credentials: 'include'
    });

    if (!res.ok) {
      Swal.fire('Erro', 'Doação não encontrada', 'error');
      return;
    }

    const d = await res.json();

    // título e botão
    document.querySelector('.topo h2').innerText = 'Editar Doação';
    document.querySelector('.btn-publicar').innerText = 'Salvar Alterações';

    // preencher campos
    document.querySelector('[name=nome_material]').value = d.nome_material;
    document.querySelector('[name=quantidade]').value = d.quantidade;
    document.querySelector('[name=tipo_material]').value = d.tipo_material;
    document.querySelector('[name=descricao]').value = d.descricao || '';
    document.querySelector('[name=horarios]').value = d.horarios;

    // bairro (aguarda carregar)
    const intervalo = setInterval(() => {
      const select = document.getElementById('bairroSelect');
      if (select.options.length > 1) {
        select.value = d.bairro_id;
        clearInterval(intervalo);
      }
    }, 100);

    // dias
    if (d.dias_semana) {
      d.dias_semana.split(',').forEach(dia => {
        const cb = document.querySelector(
          `.dias-grid input[value="${dia.trim()}"]`
        );
        if (cb) cb.checked = true;
      });
    }

    // imagem preview
    if (d.imagem) {
      previewImagem.src = `/uploads/${d.imagem}`;
      previewImagem.style.display = 'block';
    }

  } catch (err) {
    console.error(err);
  }
}

if (idEdicao) {
  carregarEdicao(idEdicao);
}

// ==========================
// PREVIEW DA IMAGEM
// ==========================
const inputImagem = document.querySelector('input[name="imagem"]');
const previewImagem = document.getElementById('previewImagem');

if (inputImagem) {
  inputImagem.addEventListener('change', () => {
    const file = inputImagem.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Arquivo inválido',
        text: 'Envie apenas arquivos de imagem.',
        confirmButtonColor: '#347142'
      });
      inputImagem.value = '';
      previewImagem.style.display = 'none';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      previewImagem.src = reader.result;
      previewImagem.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
}

// ==========================
// ENVIO DO FORMULÁRIO
// ==========================
document.getElementById('formDoacao').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  // dias selecionados
  const diasSelecionados = Array.from(
    document.querySelectorAll('.dias-grid input[type="checkbox"]:checked')
  ).map(cb => cb.value);

  if (diasSelecionados.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Dias obrigatórios',
      text: 'Selecione ao menos um dia disponível.',
      confirmButtonColor: '#347142'
    });
    return;
  }

  formData.set('dias_semana', diasSelecionados.join(', '));

  // valida quantidade
  const quantidade = Number(formData.get('quantidade'));
  if (!quantidade || quantidade <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Quantidade inválida',
      text: 'Informe uma quantidade maior que zero.',
      confirmButtonColor: '#347142'
    });
    return;
  }

  // valida horário
  if (!formData.get('horarios')) {
    Swal.fire({
      icon: 'warning',
      title: 'Horário obrigatório',
      text: 'Selecione um horário disponível.',
      confirmButtonColor: '#347142'
    });
    return;
  }

  // imagem obrigatória apenas ao CRIAR
  if (!idEdicao && !inputImagem.files[0]) {
    Swal.fire({
      icon: 'warning',
      title: 'Imagem obrigatória',
      text: 'Selecione uma imagem do material.',
      confirmButtonColor: '#347142'
    });
    return;
  }

  try {
    const url = idEdicao ? `/doacoes/${idEdicao}` : '/doacoes';
    const method = idEdicao ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      body: formData,
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao salvar');
    }

    Swal.fire({
      icon: 'success',
      title: idEdicao ? 'Doação atualizada!' : 'Doação publicada!',
      confirmButtonColor: '#347142'
    });

    setTimeout(() => {
      window.location.href = '/minhas-publicacoes';
    }, 1200);

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao salvar a doação.',
      confirmButtonColor: '#347142'
    });
  }
});
