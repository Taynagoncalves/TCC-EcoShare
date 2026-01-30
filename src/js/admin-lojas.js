const lista = document.getElementById('listaLojas');
const form = document.getElementById('formLoja');


// CARREGAR LOJAS

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


// CRIAR LOJA

form.addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const res = await fetch('/api/admin/lojas', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: data.erro || 'Erro ao cadastrar loja',
        confirmButtonColor: '#347142'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Loja cadastrada com sucesso!',
      text: 'A loja já está disponível para resgate.',
      confirmButtonColor: '#347142'
    });

    form.reset();
    carregarLojas();

  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erro inesperado',
      text: 'Não foi possível cadastrar a loja.',
      confirmButtonColor: '#347142'
    });
  }
});


// EXCLUIR LOJA
async function excluirLoja(id) {
  const confirmacao = await Swal.fire({
    title: 'Excluir loja?',
    text: 'Todos os cupons resgatados dessa loja também serão removidos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c62828',
    cancelButtonColor: '#9e9e9e'
  });

  if (!confirmacao.isConfirmed) return;

  try {
    const res = await fetch(`/api/admin/lojas/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: data.erro || 'Erro ao excluir loja'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Loja excluída!',
      text: 'A loja e seus resgates foram removidos.',
      timer: 1800,
      showConfirmButton: false
    });

    carregarLojas();

  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erro inesperado',
      text: 'Não foi possível excluir a loja.'
    });
  }
}

carregarLojas();
