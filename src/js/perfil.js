document.addEventListener('DOMContentLoaded', carregarPerfil);

async function carregarPerfil() {
  try {
    const userRes = await fetch('/usuario-logado', {
      credentials: 'include'
    });
    if (!userRes.ok) throw new Error();

    const usuario = await userRes.json();

    const pontosRes = await fetch('/usuarios/pontos', {
      credentials: 'include'
    });
    if (!pontosRes.ok) throw new Error();

    const pontosData = await pontosRes.json();

    document.getElementById('nome').value = usuario.nome || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('telefone').value = usuario.telefone || '';
    document.getElementById('dataNascimento').value =
      usuario.data_nascimento
        ? usuario.data_nascimento.split('T')[0]
        : '';

    // ✅ pontos no perfil
    document.getElementById('pontosUsuario').innerText =
      `${pontosData.pontos} pts`;

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
