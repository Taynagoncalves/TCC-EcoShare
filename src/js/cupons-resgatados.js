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
        <strong>${c.loja_nome}</strong>
        <span>${c.pontos_usados} pontos</span>

        <button onclick="verCodigo('${c.codigo}')">
          Ver código
        </button>
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

document.addEventListener('DOMContentLoaded', carregarCupons);
