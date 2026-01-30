//mostrar e ocultar senha
function toggleSenha(id, icon) {
  const input = document.getElementById(id);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    icon.src = "../icons/olhoaberto.png";
  } else {
    input.type = "password";
    icon.src = "../icons/olhofechado.png";
  }
}
// Bloquear números no campo nome
const inputNome = document.querySelector('input[name="nome"]');

inputNome.addEventListener('input', () => {
  inputNome.value = inputNome.value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
});

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

const dados = {
  nome: e.target.nome.value,
  email: e.target.email.value,
  telefone: e.target.telefone.value,
  data_nascimento: e.target.data_nascimento.value,
  senha: e.target.senha.value,
  cep: e.target.cep.value,
  endereco: e.target.endereco.value,
  numero: e.target.numero.value,
  complemento: e.target.complemento.value
};

  try {
    const res = await fetch('/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const json = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no cadastro',
        text: json.error || 'Não foi possível criar a conta',
        confirmButtonColor: '#d33'
      });
      return;
    }

 
    Swal.fire({
      icon: 'success',
      title: 'Cadastro realizado!',
      text: 'Sua conta foi criada com sucesso. Faça login para continuar.',
      confirmButtonText: 'Ir para login',
      confirmButtonColor: '347142'
    }).then(() => {
      window.location.href = '/login';
    });

  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao conectar com o servidor'
    });
  }
});
