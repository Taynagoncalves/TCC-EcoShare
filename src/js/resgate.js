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
      body: JSON.stringify({ loja_id: lojaId })
    });

    const data = await res.json();

    // ERROS DE REGRA (ATENÇÃO)
    if (!res.ok) {
      const mensagem = data.erro || 'Não foi possível resgatar o cupom';

      // erros esperados → warning
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
      } 
      // erros 
      else {
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

    carregarPontosTopo();

  } catch (err) {
    // ❌ erro inesperado (rede / servidor)
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
