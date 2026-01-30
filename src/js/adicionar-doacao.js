// carregar bairros
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

// preview da imagem + bloqueio de arquivos não imagem
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

// envio do formulário
document.getElementById('formDoacao').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

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

  formData.append('dias_semana', diasSelecionados.join(', '));

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
  const horario = formData.get('horarios');
  if (!horario) {
    Swal.fire({
      icon: 'warning',
      title: 'Horário obrigatório',
      text: 'Selecione um horário disponível.',
      confirmButtonColor: '#347142'
    });
    return;
  }

  // valida imagem
  const imagem = inputImagem.files[0];
  if (!imagem) {
    Swal.fire({
      icon: 'warning',
      title: 'Imagem obrigatória',
      text: 'Selecione uma imagem do material.',
      confirmButtonColor: '#347142'
    });
    return;
  }

  try {
    const res = await fetch('/doacoes', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao cadastrar doação');
    }

    Swal.fire({
      icon: 'success',
      title: 'Doação publicada!',
      text: 'Sua doação foi cadastrada com sucesso.',
      confirmButtonColor: '#347142'
    });

    setTimeout(() => {
      window.location.href = '/telahome';
    }, 1200);

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao cadastrar doação.',
      confirmButtonColor: '#347142'
    });
  }
});
