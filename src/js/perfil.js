document.addEventListener('DOMContentLoaded', carregarPerfil);

async function carregarPerfil() {
  try {
    // 🔹 dados do usuário
    const userRes = await fetch('/usuario-logado');
    if (!userRes.ok) throw new Error('Erro usuário');

    const usuario = await userRes.json();

    // 🔹 pontos
    const pontosRes = await fetch('/usuarios/pontos');
    if (!pontosRes.ok) throw new Error('Erro pontos');

    const pontos = await pontosRes.json();

    document.getElementById('nome').value = usuario.nome || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('telefone').value = usuario.telefone || '';
    document.getElementById('dataNascimento').value =
      usuario.data_nascimento
        ? usuario.data_nascimento.split('T')[0]
        : '';

    document.getElementById('pontosUsuario').innerText =
      `${pontos.pontos || 0} pts`;

  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
    alert('Erro ao carregar perfil');
  }
}
