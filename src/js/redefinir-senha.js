const form = document.getElementById('formRedefinir');

// pega o token da URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;

  if (senha !== confirmar) {
    alert('As senhas não coincidem');
    return;
  }

  const res = await fetch('/redefinir-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, senha })
  });

  const json = await res.json();

  if (!res.ok) {
    alert(json.error);
    return;
  }

  alert('Senha redefinida com sucesso!');
  window.location.href = '/login';
});
