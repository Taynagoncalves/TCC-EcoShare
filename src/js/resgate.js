async function carregarResgate() {
  const lojasRes = await fetch('/admin/lojas');
  const lojas = await lojasRes.json();

  const userRes = await fetch('/usuario-logado');
  const usuario = await userRes.json();

  document.getElementById('pontosUsuario').innerText =
    `Seus pontos: ${usuario.pontos}`;

  const lista = document.getElementById('listaCupons');
  lista.innerHTML = '';

  lojas.forEach(loja => {
    lista.innerHTML += `
      <div class="cupom">
        <h3>${loja.nome}</h3>
        <p>${loja.descricao || ''}</p>
        <p><strong>${loja.pontos} pontos</strong></p>
        <button onclick="resgatar(${loja.id}, ${loja.pontos})">
          Resgatar
        </button>
      </div>
    `;
  });
}

async function resgatar(lojaId, pontos) {
  if (!confirm(`Deseja resgatar este cupom por ${pontos} pontos?`)) return;

  const res = await fetch('/resgatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loja_id: lojaId })
  });

  const data = await res.json();

if (data.sucesso) {
  alert(
    `Cupom resgatado com sucesso!\n\nCódigo do cupom:\n${data.codigo}`
  );
  carregarResgate();
} else {
  alert(data.erro);
}

}
async function carregarLojas() {
  const res = await fetch('/api/lojas');
  const lojas = await res.json();

  const container = document.getElementById('lista-lojas');
  container.innerHTML = '';

  lojas.forEach(loja => {
    container.innerHTML += `
      <div class="loja-card">
        <img src="/uploads/${loja.imagem}" />
        <h3>${loja.nome}</h3>
        <p>${loja.descricao}</p>
        <strong>${loja.pontos} pontos</strong>
        <button onclick="resgatar(${loja.id})">
          Resgatar
        </button>
      </div>
    `;
  });
}

carregarLojas();

carregarResgate();
