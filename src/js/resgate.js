// atualiza o saldo de pontos no topo
async function carregarPontosTopo() {
  try {
    const res = await fetch('/usuarios/pontos', {
      credentials: 'include'
    });

    if (!res.ok) return;

    const data = await res.json();

    const saldo = document.getElementById('saldoPontos');
    if (saldo) {
      saldo.innerText = `${data.pontos} pts`;
    }

  } catch (err) {
    console.error('erro ao carregar pontos:', err);
  }
}
let cuponsResgatados = new Set();

async function carregarResgate() {
  try {
    await carregarPontosTopo();

    // pega lojas
    const lojasRes = await fetch('/lojas', { credentials: 'include' });
    if (!lojasRes.ok) throw new Error();
    const lojas = await lojasRes.json();

    // pega cupons do usuário
    const meusRes = await fetch('/resgates/meus', { credentials: 'include' });
    const meus = await meusRes.json();

    // guarda ids resgatados
    cuponsResgatados.clear();
    meus.forEach(c => cuponsResgatados.add(c.loja_id));

    const lista = document.getElementById('listaCupons');
    lista.innerHTML = '';

    lojas.forEach(loja => {

      const jaResgatado = cuponsResgatados.has(loja.id);

      lista.innerHTML += `
        <div class="cupom-card">
          <div class="cupom-topo">
            <img src="${loja.imagem ? `/uploads/${loja.imagem}` : '/imagens/loja-padrao.png'}" class="logo-loja">

            <div class="cupom-info">
              <h3>${loja.nome}</h3>
              <p class="descricao">${loja.descricao || 'loja parceira ecoshare'}</p>
            </div>
          </div>

          <div class="cupom-rodape">
            <span class="pontos">${loja.pontos} pontos</span>

            <button 
              id="btn-${loja.id}"
              class="${jaResgatado ? 'btn-resgatado' : ''}"
              ${jaResgatado ? 'disabled' : ''}
              onclick="resgatar(${loja.id})"
            >
              ${jaResgatado ? 'Resgatado' : 'Resgatar'}
            </button>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}

// resgatar cupom
async function resgatar(lojaId) {
  try {
    const res = await fetch('/resgates/resgatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ loja_id: lojaId })
    });

    const data = await res.json();

    if (!res.ok) {
      const mensagem = data.erro || 'Não foi possível resgatar o cupom';

      if (
        mensagem.includes('pontos insuficientes') ||
        mensagem.includes('já resgatou')
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: mensagem,
          confirmButtonColor: '#347142'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: mensagem,
          confirmButtonColor: '#347142'
        });
      }
      return;
    }

    // SUCESSO
    Swal.fire({
      icon: 'success',
      title: 'Cupom resgatado 🎉',
      html: `
        <strong>Código do cupom:</strong><br>
        <span style="font-size:18px">${data.codigo}</span><br><br>
        <small>Pontos restantes: ${data.pontos_restantes}</small>
      `,
      confirmButtonColor: '#347142'
    });

    // 👉 ATUALIZA O BOTÃO NA HORA
    const botao = document.getElementById(`btn-${lojaId}`);
    if (botao) {
      botao.innerText = 'Resgatado';
      botao.classList.add('btn-resgatado');
      botao.disabled = true;
    }

    // 👉 atualiza pontos
    carregarPontosTopo();

  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Erro inesperado',
      text: 'Não foi possível concluir o resgate.',
      confirmButtonColor: '#347142'
    });
  }
}


// filtrar lojas pelo nome
function filtrarLojas(texto) {
  const filtro = texto.toLowerCase();
  const cards = document.querySelectorAll('.cupom-card');

  cards.forEach(card => {
    const nomeLoja = card
      .querySelector('.cupom-info h3')
      .innerText
      .toLowerCase();

    card.style.display = nomeLoja.includes(filtro)
      ? 'flex'
      : 'none';
  });
}

// inicializa a tela
document.addEventListener('DOMContentLoaded', carregarResgate);
