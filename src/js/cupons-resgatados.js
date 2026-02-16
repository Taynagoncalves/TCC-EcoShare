const lista = document.getElementById('listaCupons');

async function carregarCupons() {
  try {
    const res = await fetch('/resgates/meus', {
      credentials: 'include'
    });

    if (!res.ok) {
      lista.innerHTML = '<p>Erro ao carregar cupons.</p>';
      return;
    }

    const cupons = await res.json();
    lista.innerHTML = '';

    if (!cupons || cupons.length === 0) {
      lista.innerHTML = '<p>Você ainda não resgatou nenhum cupom.</p>';
      return;
    }

    cupons.forEach(c => {
      const imagem = c.loja_imagem
        ? `/uploads/${c.loja_imagem}`
        : '/icons/loja.png';

      const endereco = c.loja_endereco || '';

      const card = document.createElement('div');
      card.className = 'cupom-card';

      card.innerHTML = `
        <div class="cupom-esquerda">
          <img src="${imagem}" class="cupom-logo">

          <div class="cupom-dados">
            <strong>${c.loja_nome}</strong>
            <span>${c.pontos_usados} pontos</span>
          </div>
        </div>

        <div class="cupom-acoes">
          <button class="btn-codigo">
            Ver código
          </button>

          <img 
            src="/icons/localizacao.png"
            class="btn-localizacao"
            title="Ver endereço da loja"
          >
        </div>
      `;

      /* eventos seguros */
      card.querySelector('.btn-codigo')
        .addEventListener('click', () => verCodigo(c.codigo));

      card.querySelector('.btn-localizacao')
        .addEventListener('click', () => verEndereco(endereco));

      lista.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    lista.innerHTML = '<p>Erro inesperado.</p>';
  }
}

/* =========================
   VER CÓDIGO
========================= */
function verCodigo(codigo) {
  Swal.fire({
    title: 'Código do Cupom',
    text: codigo,
    icon: 'success',
    confirmButtonText: 'Ok',
    confirmButtonColor: '#347142'
  });
}

/* =========================
   ENDEREÇO
========================= */
function verEndereco(endereco) {

  if (!endereco || endereco === 'null' || endereco.trim() === '') {
    Swal.fire({
      icon: 'info',
      title: 'Endereço indisponível',
      text: 'A loja ainda não cadastrou um endereço.'
    });
    return;
  }

  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;

  Swal.fire({
    title: 'Endereço da loja',
    html: `
      <b>${endereco}</b><br><br>
      <a href="${maps}" target="_blank">Abrir no Google Maps</a>
    `,
    icon: 'info',
    confirmButtonColor: '#347142'
  });
}

/* =========================
   VOLTAR
========================= */
function voltarConfiguracoes() {
  window.location.href = '/configuracoes';
}

document.addEventListener('DOMContentLoaded', carregarCupons);
