const lista = document.getElementById('listaLojas');
const form = document.getElementById('formLoja');

// ==========================
// CARREGAR LOJAS
// ==========================
async function carregarLojas() {
  const res = await fetch('/api/admin/lojas');
  const lojas = await res.json();

  lista.innerHTML = '';

  if (lojas.length === 0) {
    lista.innerHTML = '<p>Nenhuma loja cadastrada.</p>';
    return;
  }

  lojas.forEach(l => {
    lista.innerHTML += `
      <div class="loja">
        <strong>${l.nome}</strong><br/>
        ${l.descricao || ''}<br/>
        Pontos necessários: ${l.pontos}<br/>
        <button onclick="excluirLoja(${l.id})">Excluir</button>
      </div>
    `;
  });
}

// ==========================
// CRIAR LOJA
// ==========================
form.addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData(form);

  await fetch('/api/admin/lojas', {
    method: 'POST',
    body: formData
  });

  form.reset();
  carregarLojas();
});

// ==========================
// EXCLUIR LOJA
// ==========================
async function excluirLoja(id) {
  if (!confirm('Deseja excluir esta loja?')) return;

  await fetch(`/api/admin/lojas/${id}`, {
    method: 'DELETE'
  });

  carregarLojas();
}

// ==========================
// INIT
// ==========================
carregarLojas();
