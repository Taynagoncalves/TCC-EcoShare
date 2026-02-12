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

    lojasCache = await res.json();
    renderizarLojas(lojasCache);

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

function renderizarLojas(lojas) {
  lista.innerHTML = '';

  if (!lojas || lojas.length === 0) {
    lista.innerHTML = '<p>Nenhuma loja encontrada.</p>';
    return;
  }

  lojas.forEach(l => {
    lista.innerHTML += `
      <div class="loja-card">
        <h3>${l.nome}</h3>
        <p>${l.descricao || ''}</p>
        <p class="label">${l.endereco || 'Endereço não informado'}</p>
        <span class="badge">${l.pontos} pontos</span>

        <button class="btn-excluir" onclick="excluirLoja(${l.id})">
          Excluir
        </button>
      </div>
    `;
  });
}
document.getElementById('buscarLoja')?.addEventListener('input', e => {
  const termo = e.target.value.toLowerCase();

  const filtradas = lojasCache.filter(l =>
    l.nome.toLowerCase().includes(termo) ||
    (l.descricao || '').toLowerCase().includes(termo) ||
    (l.endereco || '').toLowerCase().includes(termo)
  );

  renderizarLojas(filtradas);
});

/* =========================
   CRIAR LOJA (ADMIN)
========================= */
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const enderecoInput = document.getElementById('endereco');
    const numeroInput = document.getElementById('numero');

    if (!enderecoInput.value.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Endereço obrigatório'
      });
      return;
    }

    if (!numeroInput.value.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Número obrigatório'
      });
      return;
    }

    // monta endereço final
    if (enderecoInput.dataset.rua) {
      enderecoInput.value =
        `${enderecoInput.dataset.rua}, ${numeroInput.value} - ${enderecoInput.dataset.bairro} - ${enderecoInput.dataset.cidade}/${enderecoInput.dataset.uf}`;
    } else {
      enderecoInput.value = `${enderecoInput.value}, ${numeroInput.value}`;
    }

    const formData = new FormData(form);

    try {
      const res = await fetch('/lojas/admin', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      let data;
      const text = await res.text();

      try {
        data = JSON.parse(text);
      } catch {
        console.error('Resposta não é JSON:', text);
        throw new Error('Erro interno do servidor');
      }

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
        confirmButtonColor: '#347142'
      });

      form.reset();
      carregarLojas();

    } catch (err) {
      console.error('ERRO FRONT:', err);

      Swal.fire({
        icon: 'error',
        title: 'Erro inesperado',
        text: 'Servidor retornou erro interno (500). Veja o terminal do Node.',
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
      timer: 1500,
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
   BUSCAR CEP AUTOMÁTICO
========================= */
document.addEventListener('DOMContentLoaded', () => {

  carregarLojas();

  const campoCep = document.getElementById('cep');
  const campoEndereco = document.getElementById('endereco');

  if (!campoCep || !campoEndereco) return;

  let timeoutCep;

  campoCep.addEventListener('input', e => {

    clearTimeout(timeoutCep);

    timeoutCep = setTimeout(async () => {

      let cep = e.target.value.replace(/\D/g, '');

      if (cep.length !== 8) return;

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();

        if (data.erro) {
          Swal.fire({
            icon: 'warning',
            title: 'CEP não encontrado'
          });
          return;
        }

        // guarda dados separadamente
        campoEndereco.dataset.rua = data.logradouro;
        campoEndereco.dataset.bairro = data.bairro;
        campoEndereco.dataset.cidade = data.localidade;
        campoEndereco.dataset.uf = data.uf;

        campoEndereco.value =
          `${data.logradouro} - ${data.bairro} - ${data.localidade}/${data.uf}`;

      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao buscar CEP'
        });
      }

    }, 500);

  });
});
