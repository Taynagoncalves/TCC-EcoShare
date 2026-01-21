async function carregarNotificacoes() {
  const res = await fetch('/coletas/recebidas');
  const dados = await res.json();

  const sino = document.getElementById('iconeNotificacao');

  if (dados.length > 0) {
    sino.classList.add('ativo');
  }
}
async function carregarNotificacoes() {
  try {
    const res = await fetch('/coletas/recebidas');

    if (!res.ok) {
      throw new Error('Erro ao buscar notificações');
    }

    const dados = await res.json();
    const lista = document.getElementById('listaNotificacoes');
    lista.innerHTML = '';

    if (!dados.length) {
      lista.innerHTML = '<p style="padding:20px">Nenhuma notificação no momento.</p>';
      return;
    }

    dados.forEach(n => {
      lista.innerHTML += `
        <div class="card">
          <img src="${n.imagem ? `/uploads/${n.imagem}` : '/imagens/sem-imagem.png'}">

          <h3>Solicitação de Coleta</h3>

          <p><strong>Material:</strong> ${n.nome_material}</p>
          <p><strong>Quantidade:</strong> ${n.quantidade}</p>
          <p><strong>Solicitante:</strong> ${n.solicitante}</p>

          <div class="acoes">
         <button class="recusar" onclick="recusar(${n.solicitacao_id})">Recusar</button>
<button class="confirmar" onclick="confirmar(${s.solicitacao_id})">Confirmar</button>

          </div>
        </div>
      `;
    });

  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  }
}

async function confirmar(id) {
  await fetch(`/coletas/${id}/confirmar`, { method: 'PUT' });
  carregarNotificacoes();
}

async function recusar(id) {
  await fetch(`/coletas/${id}/recusar`, { method: 'PUT' });
  carregarNotificacoes();
}

document.addEventListener('DOMContentLoaded', carregarNotificacoes);
