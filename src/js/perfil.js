document.addEventListener('DOMContentLoaded', () => {
  carregarPerfil();
  setupEdicao();
});

let perfilOriginal = null;
let modoEdicao = false;

function setupEdicao() {
  const btnEditar = document.getElementById('btnEditar');
  const btnSalvar = document.getElementById('btnSalvar');
  const btnCancelar = document.getElementById('btnCancelar');

  const btnTrocarFoto = document.getElementById('btnTrocarFoto');
  const inputFoto = document.getElementById('inputFoto');

  btnEditar.addEventListener('click', () => entrarEdicao());
  btnCancelar.addEventListener('click', () => cancelarEdicao());
  btnSalvar.addEventListener('click', () => salvarEdicao());

  btnTrocarFoto.addEventListener('click', () => {
    if (!modoEdicao) {
      Swal.fire({
        icon: 'info',
        title: 'Ative a edição',
        text: 'Clique em "Editar perfil" para trocar a foto.',
        confirmButtonColor: '#347142'
      });
      return;
    }
    inputFoto.click();
  });

  inputFoto.addEventListener('change', async () => {
    if (!inputFoto.files || !inputFoto.files[0]) return;
    await enviarFoto(inputFoto.files[0]);
  });
}

async function carregarPerfil() {
  try {
    const userRes = await fetch('/usuarios/me', { credentials: 'include' });
    if (!userRes.ok) throw new Error();

    const usuario = await userRes.json();

    const pontosRes = await fetch('/usuarios/pontos', { credentials: 'include' });
    if (!pontosRes.ok) throw new Error();

    const pontosData = await pontosRes.json();

    // guarda original (pra cancelar)
    perfilOriginal = {
      nome: usuario.nome || '',
      email: usuario.email || '',
      telefone: usuario.telefone || '',
      data_nascimento: usuario.data_nascimento
        ? usuario.data_nascimento.split('T')[0]
        : '',
      foto: usuario.foto || ''
    };

    // preenche
    setCampos(perfilOriginal);

    document.getElementById('pontosUsuario').innerText = `${pontosData.pontos} pts`;

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao carregar perfil',
      confirmButtonColor: '#347142'
    });
  }
}

function setCampos(dados) {
  document.getElementById('nome').value = dados.nome;
  document.getElementById('email').value = dados.email;
  document.getElementById('telefone').value = dados.telefone;
  document.getElementById('dataNascimento').value = dados.data_nascimento || '';

  const avatar = document.getElementById('avatarImg');

  // SEMPRE define um src válido
  avatar.src = dados.foto && dados.foto.trim() !== ''
    ? dados.foto
    : '/icons/user.png';
}


function setInputsHabilitados(habilitar) {
  document.getElementById('nome').disabled = !habilitar;
  document.getElementById('email').disabled = !habilitar;
  document.getElementById('telefone').disabled = !habilitar;
  document.getElementById('dataNascimento').disabled = !habilitar;
}

function entrarEdicao() {
  if (!perfilOriginal) return;

  modoEdicao = true;
  setInputsHabilitados(true);

  document.getElementById('btnEditar').hidden = true;
  document.getElementById('btnSalvar').hidden = false;
  document.getElementById('btnCancelar').hidden = false;
}

function cancelarEdicao() {
  if (!perfilOriginal) return;

  modoEdicao = false;
  setInputsHabilitados(false);
  setCampos(perfilOriginal);

  document.getElementById('btnEditar').hidden = false;
  document.getElementById('btnSalvar').hidden = true;
  document.getElementById('btnCancelar').hidden = true;

  // limpa input file (pra poder selecionar a mesma foto de novo se quiser)
  const inputFoto = document.getElementById('inputFoto');
  inputFoto.value = '';
}

async function salvarEdicao() {
  try {
    const payload = {
      nome: document.getElementById('nome').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      data_nascimento: document.getElementById('dataNascimento').value || null
    };

    const res = await fetch('/usuarios/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao salvar');
    }

    // atualiza original
    perfilOriginal = {
      ...perfilOriginal,
      nome: data.usuario?.nome ?? payload.nome,
      email: data.usuario?.email ?? payload.email,
      telefone: data.usuario?.telefone ?? payload.telefone,
      data_nascimento: data.usuario?.data_nascimento
        ? String(data.usuario.data_nascimento).split('T')[0]
        : (payload.data_nascimento || '')
    };

    modoEdicao = false;
    setInputsHabilitados(false);

    document.getElementById('btnEditar').hidden = false;
    document.getElementById('btnSalvar').hidden = true;
    document.getElementById('btnCancelar').hidden = true;

    Swal.fire({
      icon: 'success',
      title: 'Perfil atualizado!',
      text: 'Seus dados foram salvos com sucesso.',
      confirmButtonColor: '#347142'
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: err.message || 'Erro ao salvar perfil',
      confirmButtonColor: '#347142'
    });
  }
}

async function enviarFoto(file) {
  try {
    // preview imediato
    const avatar = document.getElementById('avatarImg');
    const previewUrl = URL.createObjectURL(file);
    avatar.src = previewUrl;

    const form = new FormData();
    form.append('foto', file);

    const res = await fetch('/usuarios/me/foto', {
      method: 'PUT',
      credentials: 'include',
      body: form
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao enviar foto');
    }

    // foto final (servida do servidor)
    if (data.foto) {
      avatar.src = data.foto;
      if (perfilOriginal) perfilOriginal.foto = data.foto;
    }

    Swal.fire({
      icon: 'success',
      title: 'Foto atualizada!',
      confirmButtonColor: '#347142'
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: err.message || 'Erro ao atualizar foto',
      confirmButtonColor: '#347142'
    });

    // se falhar, volta a foto antiga
    if (perfilOriginal?.foto) {
      document.getElementById('avatarImg').src = perfilOriginal.foto;
    } else {
      document.getElementById('avatarImg').src = '../icons/user.png';
    }
  }
}