document.addEventListener('DOMContentLoaded', carregarHistorico);

async function carregarHistorico() {
  const container = document.getElementById('listaHistorico');
  container.innerHTML = '';

  try {
    const res = await fetch('/api/historico')

    const dados = await res.json();

    // ✅ SE NÃO TEM NADA, NÃO MOSTRA NADA
    if (!dados.length) {
      container.innerHTML = `
        <p style="text-align:center; color:#666">
          Nenhuma doação ou coleta concluída ainda.
        </p>
      `;
      return;
    }

    dados.forEach(h => {
      const tipo =document.addEventListener('DOMContentLoaded', carregarHistorico);

async function carregarHistorico() {
  const container = document.getElementById('listaHistorico');
  container.innerHTML = '';

  try {
    const res = await fetch('/historico');
    const dados = await res.json();

    if (!dados.length) {
      container.innerHTML = `
        <p style="text-align:center; color:#666">
          Nenhuma doação ou coleta concluída ainda.
        </p>
      `;
      return;
    }

    // 🔹 buscar usuário logado
    const userRes = await fetch('/usuario-logado');
    const usuario = await userRes.json();
    const usuarioId = usuario.id;

    dados.forEach(h => {
      const ehDoador = h.doador_id === usuarioId;

      container.innerHTML += `
        <div class="card-historico">
          <img src="/uploads/${h.imagem}" alt="Imagem da doação">

          <p class="status">Concluído</p>

          <p><strong>${h.nome_material}</strong> - ${h.quantidade} unidades</p>

          <p>
            ${ehDoador ? 'Você doou' : 'Você coletou'}
          </p>

          ${ehDoador ? '<p class="pontos">+20 pontos</p>' : ''}
        </div>
      `;
    });

  } catch (err) {
    console.error('Erro ao carregar histórico:', err);
    container.innerHTML = `
      <p style="color:red; text-align:center">
        Erro ao carregar histórico
      </p>
    `;
  }
}

        h.doador_id === window.usuarioId
          ? 'doacao'
          : 'coleta';

      container.innerHTML += `
        <div class="card-historico">
          <img src="${h.imagem ? `/uploads/${h.imagem}` : '/imagens/sem-imagem.png'}">

          <p class="status">Concluído</p>

          <p><strong>${h.nome_material}</strong> - ${h.quantidade} unidades</p>

          <p>
            ${tipo === 'doacao'
              ? 'Você doou'
              : 'Você coletou'}
          </p>

          ${tipo === 'doacao'
            ? '<p class="pontos">+20 pontos</p>'
            : ''}
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar histórico');
  }
}
