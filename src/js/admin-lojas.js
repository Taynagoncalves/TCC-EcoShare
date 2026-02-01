const lista = document.getElementById('listaLojas');
const form = document.getElementById('formLoja');

/* =========================
   CARREGAR LOJAS (ADMIN)
========================= */
async function carregarLojas() {
  try {
    const res = await fetch('/lojas/admin', {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Erro ao buscar lojas');

    const lojas = await res.json();
    lista.innerHTML = '';

    if (!lojas || lojas.length === 0) {
      lista.innerHTML = '<p>Nenhuma loja cadastrada.</p>';
      return;
    }

    lojas.forEach(l => {
      lista.innerHTML += `
        <div class="loja">
          <strong>${l.nome}</strong><br/>
          ${l.descricao || ''}<br/>
          <span><b>Pontos necessários:</b> ${l.pontos}</span><br/>
          <button onclick="excluirLoja(${l.id})">
            Excluir
          </button>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao carregar lojas',
      confirmButtonColor: '#347142'
    });
  }
}

/* =========================
   CRIAR LOJA (ADMIN)
========================= */
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const res = await fetch('/lojas/admin', {
        method: 'POST',
        body: formData,
        credentials: 'include'
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
        title: 'Loja cadastrada!',
        text: 'A loja já está disponível para resgate.',
        confirmButtonColor: '#347142'
      });

      form.reset();
      carregarLojas();

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Erro inesperado',
        text: 'Não foi possível cadastrar a loja.',
        confirmButtonColor: '#347142'
      });
    }
  });
}

/* =========================
   EXCLUIR LOJA (ADMIN)
========================= */
async function excluirLoja(id) {
  const confirmacao = await Swal.fire({
    title: 'Excluir loja?',
    text: 'Todos os cupons relacionados a esta loja também serão removidos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c62828',
    cancelButtonColor: '#9e9e9e'
  });

  if (!confirmacao.isConfirmed) return;

  try {
    const res = await fetch(`/lojas/admin/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: data.erro || 'Erro ao excluir loja',
        confirmButtonColor: '#347142'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Loja excluída!',
      text: 'A loja foi removida com sucesso.',
      timer: 1600,
      showConfirmButton: false
    });

    carregarLojas();

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro inesperado',
      text: 'Não foi possível excluir a loja.',
      confirmButtonColor: '#347142'
    });
  }
}

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', carregarLojas);
