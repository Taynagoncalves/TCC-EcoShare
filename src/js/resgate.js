// 🔹 Atualiza o saldo de pontos no topo
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
    console.error('Erro ao carregar pontos:', err);
  }
}

// 🔹 Carrega lojas para resgate (ROTA CORRETA)
async function carregarResgate() {
  try {
    // saldo primeiro
    await carregarPontosTopo();

    // 🔥 ROTA CERTA (usuário)
    const res = await fetch('/api/lojas');
    if (!res.ok) throw new Error();

    const lojas = await res.json();

    const lista = document.getElementById('listaCupons');
    lista.innerHTML = '';

    if (lojas.length === 0) {
      lista.innerHTML = '<p>Nenhuma loja disponível no momento.</p>';
      return;
    }

lojas.forEach(loja => {
  lista.innerHTML += `
    <div class="cupom-card">
      <div class="cupom-topo">
        <img 
          src="/uploads/${loja.imagem}" 
          alt="${loja.nome}" 
          class="logo-loja"
          onerror="this.src='/img/loja-padrao.png'"
        >

        <div class="cupom-info">
          <h3>${loja.nome}</h3>
          <p class="descricao">
            ${loja.descricao || 'Loja parceira EcoShare'}
          </p>
        </div>
      </div>

      <div class="cupom-rodape">
        <span class="pontos">${loja.pontos} pontos</span>
        <button onclick="resgatar(${loja.id})">
          Resgatar
        </button>
      </div>
    </div>
  `;
});


      
    

  } catch (err) {
    console.error('Erro ao carregar resgate:', err);
  }
}

// 🔹 Resgatar cupom
async function resgatar(lojaId) {
  try {
    const res = await fetch('/resgatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        loja_id: lojaId //  SOMENTE ISSO
      })
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: data.erro || 'Erro ao resgatar cupom',
        confirmButtonColor: '#347142'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Cupom resgatado!',
      text: `Código: ${data.codigo}`,
      confirmButtonColor: '#347142'
    });

    // 🔄 Atualiza pontos no topo
    carregarPontosTopo();

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro inesperado ao resgatar',
      confirmButtonColor: '#347142'
    });
  }
}
function filtrarLojas(texto) {
  const filtro = texto.toLowerCase();
  const cards = document.querySelectorAll('.cupom-card');

  cards.forEach(card => {
    const nomeLoja = card
      .querySelector('.cupom-info h3')
      .innerText
      .toLowerCase();

    if (nomeLoja.includes(filtro)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// 🚀 inicializa a tela
carregarResgate();
