document.addEventListener('DOMContentLoaded', carregarHistorico);

async function carregarHistorico() {
  const container = document.getElementById('listaHistorico');
  container.innerHTML = '';

  try {
    // 🔹 buscar histórico
    const res = await fetch('/coletas/historico');
    const dados = await res.json();

    // 🔹 buscar usuário logado
    const userRes = await fetch('/usuario-logado');
    const usuario = await userRes.json();
    const usuarioId = Number(usuario.id);

    if (!dados || dados.length === 0) {
      container.innerHTML = `
        <p style="text-align:center; color:#666">
          Nenhuma doação ou coleta concluída ainda.
        </p>
      `;
      return;
    }

    dados.forEach(h => {
      const ehDoador = Number(h.doador_id) === usuarioId;

      container.innerHTML += `
        <div class="card-historico">
          <img 
            src="${h.imagem ? `/uploads/${h.imagem}` : '/imagens/sem-imagem.png'}"
            alt="Imagem da doação"
          >

          <p class="status">Concluído</p>

          <p>
            <strong>${h.nome_material}</strong> - ${h.quantidade} unidades
          </p>

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
