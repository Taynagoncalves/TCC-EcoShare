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

// carrega lojas disponíveis para resgate
async function carregarResgate() {
  try {
    // carrega pontos primeiro
    await carregarPontosTopo();

    // rota correta de lojas (usuário)
    const res = await fetch('/lojas', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error();

    const lojas = await res.json();

    const lista = document.getElementById('listaCupons');
    if (!lista) return;

    lista.innerHTML = '';

    if (lojas.length === 0) {
      lista.innerHTML = '<p>nenhuma loja disponível no momento.</p>';
      return;
    }

    lojas.forEach(loja => {
      lista.innerHTML += `
        <div class="cupom-card">
          <div class="cupom-topo">
            <img 
              src="${loja.imagem ? `/uploads/${loja.imagem}` : '/imagens/loja-padrao.png'}" 
              alt="${loja.nome}" 
              class="logo-loja"
            >

            <div class="cupom-info">
              <h3>${loja.nome}</h3>
              <p class="descricao">
                ${loja.descricao || 'loja parceira ecoshare'}
              </p>
            </div>
          </div>

          <div class="cupom-rodape">
            <span class="pontos">${loja.pontos} pontos</span>
            <button onclick="resgatar(${loja.id})">
              resgatar
            </button>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error('erro ao carregar resgate:', err);
  }
}

// resgatar cupom
async function resgatar(lojaId) {
  try {
    const res = await fetch('/resgates/resgatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        loja_id: lojaId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'erro',
        text: data.erro || 'erro ao resgatar cupom',
        confirmButtonColor: '#347142'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'cupom resgatado',
      text: `código: ${data.codigo}`,
      confirmButtonColor: '#347142'
    });

    carregarPontosTopo();

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'erro',
      text: 'erro inesperado ao resgatar',
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
