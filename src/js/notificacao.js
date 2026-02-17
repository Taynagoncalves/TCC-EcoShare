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
    const res = await fetch('/notificacoes');
    const notificacoes = await res.json();

    const lista = document.getElementById('listaNotificacoes');
    lista.innerHTML = '';

    if (!notificacoes.length) {
      lista.innerHTML = '<p style="padding:15px">Nenhuma notificação</p>';
      return;
    }

    notificacoes.forEach(n => {

      let rota = '#';

      if (n.tipo === 'solicitacao')
        rota = '/solicitacoes-coleta.html';

      else if (n.tipo === 'andamento')
        rota = '/coletas-andamento.html';

      else
        return; // ignora outras

      const div = document.createElement('div');
      div.className = 'notificacao-item';
      div.style.cursor = 'pointer';

      div.innerHTML = `
        <div>${n.mensagem}</div>
        <small>${new Date(n.criada_em).toLocaleString()}</small>
      `;

      // 👇 AQUI É O CLICK REAL
      div.addEventListener('click', () => {
        window.location.href = rota;
      });

      lista.appendChild(div);
    });

  } catch (err) {
    console.error('Erro notificações:', err);
  }
}

document.addEventListener('DOMContentLoaded', carregarNotificacoes);


async function confirmar(id) {
  await fetch(`/coletas/${id}/confirmar`, { method: 'PUT' });
  carregarNotificacoes();
}

async function recusar(id) {
  await fetch(`/coletas/${id}/recusar`, { method: 'PUT' });
  carregarNotificacoes();
}

document.addEventListener('DOMContentLoaded', carregarNotificacoes);
