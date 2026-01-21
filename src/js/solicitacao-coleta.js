async function carregarSolicitacoes() {
  try {
    const res = await fetch('/coletas/recebidas');
    const solicitacoes = await res.json();

    const lista = document.getElementById('listaSolicitacoes');
    lista.innerHTML = '';

    if (!solicitacoes.length) {
      lista.innerHTML = '<p>Nenhuma solicitação pendente.</p>';
      return;
    }
solicitacoes.forEach(s => {

  lista.innerHTML += `
    <div class="card">
      <img 
        src="${s.imagem ? `/uploads/${s.imagem}` : '/imagens/sem-imagem.png'}"
        alt="Imagem da doação"
      >

      <div class="card-info">
        <h3>Solicitação de Coleta</h3>

        <p><strong>Material:</strong> ${s.nome_material}</p>
        <p><strong>Quantidade:</strong> ${s.quantidade}</p>
        <p><strong>Solicitante:</strong> ${s.solicitante}</p>

        <!--  BOTÕES -->
    <div class="acoes">
  <button class="recusar"
    onclick="recusar(${s.solicitacao_id})">
    Recusar
  </button>

  <button class="confirmar"
    onclick="confirmar(${s.solicitacao_id})">
    Confirmar
  </button>
</div>

      </div>
    </div>
  `;
});


  } catch (error) {
    console.error('Erro ao carregar solicitações:', error);
  }
}

async function confirmar(id) {
  await fetch(`/coletas/${id}/confirmar`, {
    method: 'PUT'
  });

  carregarSolicitacoes();
}

async function recusar(id) {
  await fetch(`/coletas/${id}/recusar`, {
    method: 'PUT'
  });

  carregarSolicitacoes();
}

document.addEventListener('DOMContentLoaded', carregarSolicitacoes);
