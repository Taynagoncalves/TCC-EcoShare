async function carregarCupons() {
  try {
    const res = await fetch('/resgates/meus', {
      credentials: 'include'
    });

    if (!res.ok) {
      document.getElementById('listaCupons').innerHTML =
        '<p>Erro ao carregar cupons.</p>';
      return;
    }

    const cupons = await res.json();
    const lista = document.getElementById('listaCupons');
    lista.innerHTML = '';

    if (cupons.length === 0) {
      lista.innerHTML = '<p>Você ainda não resgatou nenhum cupom.</p>';
      return;
    }

    cupons.forEach(c => {
      const div = document.createElement('div');
      div.className = 'cupom-item';

div.innerHTML = `
  <div class="cupom-item-info">
    <strong>${c.loja_nome}</strong>
    <span>${c.pontos_usados} pontos</span>
  </div>

  <div class="cupom-acoes">
    <button onclick="verCodigo('${c.codigo}')">
      Ver código
    </button>

    <img 
      src="/icons/localizacao.png"
      class="btn-localizacao"
      onclick="verEndereco('${c.loja_endereco}')"
      title="Ver endereço da loja"
    >
  </div>
`;


      lista.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    document.getElementById('listaCupons').innerHTML =
      '<p>Erro inesperado.</p>';
  }
}

function verCodigo(codigo) {
  Swal.fire({
    title: 'Código do Cupom',
    text: codigo,
    icon: 'success',
    confirmButtonText: 'Ok',
    confirmButtonColor: '#347142'
  });
}

function voltarConfiguracoes() {
  window.location.href = '/configuracoes';
}
function verEndereco(endereco) {
  if (!endereco || endereco === 'null') {
    Swal.fire({
      icon: 'info',
      title: 'Endereço indisponível',
      text: 'A loja ainda não cadastrou um endereço.'
    });
    return;
  }

  Swal.fire({
    title: 'Endereço da loja',
    html: `<b>${endereco}</b><br><br>
           <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}" target="_blank">
           Abrir no Google Maps
           </a>`,
    icon: 'info',
    confirmButtonColor: '#347142'
  });
}

document.addEventListener('DOMContentLoaded', carregarCupons);
