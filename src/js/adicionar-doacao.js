const params = new URLSearchParams(window.location.search);
const idEdicao = params.get('id');

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

    document.querySelector('.topo h2').innerText = 'Editar Doação';
    document.querySelector('.btn-publicar').innerText = 'Salvar Alterações';

    document.querySelector('[name=nome_material]').value = d.nome_material;
    document.querySelector('[name=quantidade]').value = d.quantidade;
    document.querySelector('[name=tipo_material]').value = d.tipo_material;
    document.querySelector('[name=descricao]').value = d.descricao || '';
    document.querySelector('[name=horarios]').value = d.horarios;

    const intervalo = setInterval(() => {
      const select = document.getElementById('bairroSelect');
      if (select.options.length > 1) {
        select.value = d.bairro_id;
        clearInterval(intervalo);
      }
    }, 100);

    if (d.dias_semana) {
      d.dias_semana.split(',').forEach(dia => {
        const cb = document.querySelector(`.dias-grid input[value="${dia.trim()}"]`);
        if (cb) cb.checked = true;
      });
    }

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

document.getElementById('formDoacao').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const nomeMaterial = formData.get('nome_material');
  if (!nomeMaterial || nomeMaterial.trim().length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Nome inválido',
      text: 'Informe um nome válido para o material.',
      confirmButtonColor: '#347142'
    });
    return;
  }

  formData.set('nome_material', nomeMaterial.trim());

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

  if (!formData.get('horarios')) {
    Swal.fire({
      icon: 'warning',
      title: 'Horário obrigatório',
      text: 'Selecione um horário disponível.',
      confirmButtonColor: '#347142'
    });
    return;
  }

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
