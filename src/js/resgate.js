document.addEventListener('DOMContentLoaded', carregarResgate);

async function carregarResgate() {
  // simulação (depois liga no backend)
  
  document.getElementById('pontosUsuario').innerText = `${pontos} pts`;

  const cupons = [
    {
      id: 1,
      loja: 'Avenidão Container',
      desconto: '10% de desconto',
      pontos: 80,
      imagem: '../imagens/avenidao.png'
    }
  ];

  const lista = document.getElementById('listaCupons');
  lista.innerHTML = '';

  cupons.forEach(c => {
    lista.innerHTML += `
      <div class="cupom">
        <img src="${c.imagem}">
        <div class="cupom-info">
          <h4>${c.desconto}</h4>
          <p>${c.loja}</p>
        </div>
        <button onclick="resgatar(${c.pontos})">
          ${c.pontos} pontos<br>Resgatar
        </button>
      </div>
    `;
  });
}
async function resgatar(custo) {
  const confirmar = confirm(
    `Deseja resgatar este cupom por ${custo} pontos?`
  );

  if (!confirmar) return;

  const res = await fetch('/usuarios/debitar-pontos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ custo })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.erro);
    return;
  }

  alert('Cupom resgatado com sucesso!');
  carregarPontos();
}


async function carregarPontos() {
  const res = await fetch('/usuarios/pontos');
  const data = await res.json();

  document.getElementById('pontosUsuario').innerText =
    `${data.pontos} pts`;
}

document.addEventListener('DOMContentLoaded', carregarPontos);
