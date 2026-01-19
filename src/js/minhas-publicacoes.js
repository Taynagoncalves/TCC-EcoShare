async function carregarMinhasDoacoes() {
  try {
    const res = await fetch('/minhas-doacoes');
    const doacoes = await res.json();

    const lista = document.getElementById('listaMinhasDoacoes');
    lista.innerHTML = '';

    if (doacoes.length === 0) {
      lista.innerHTML = '<p>Você ainda não tem publicações.</p>';
      return;
    }

    doacoes.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <img src="/uploads/${d.imagem}">
        <h3>${d.nome_material} - ${d.quantidade} unidades</h3>
        <p class="status ${d.status}">${formatarStatus(d.status)}</p>

        <div class="acoes">
          <button>Editar</button>
          <button>Ver</button>
          <button>Excluir</button>
        </div>
      `;

      lista.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

function formatarStatus(status) {
  if (status === 'ativo') return 'Ativo';
  if (status === 'andamento') return 'Em andamento';
  return 'Concluído';
}

carregarMinhasDoacoes();
