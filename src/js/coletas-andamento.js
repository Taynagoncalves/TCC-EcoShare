// 🔹 Carrega automaticamente ao abrir a página
document.addEventListener('DOMContentLoaded', carregarColetas);

async function carregarColetas() {
  try {
    const res = await fetch('/coletas/andamento');

    if (!res.ok) {
      throw new Error('Erro ao buscar coletas');
    }

    const dados = await res.json();
    const container = document.getElementById('lista-coletas');
    container.innerHTML = '';

    if (!dados || dados.length === 0) {
      container.innerHTML = '<p>Nenhuma coleta em andamento.</p>';
      return;
    }

    dados.forEach(c => {
      if (c.papel === 'doador') {
        container.innerHTML += cardDoador(c);
      } else {
        container.innerHTML += cardSolicitante(c);
      }
    });

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar coletas em andamento');
  }
}

/* =========================
   CARD — DOADOR
========================= */
function cardDoador(c) {
  const telefone = limparTelefone(c.solicitante_telefone);

  return `
    <div class="card coleta">
      <img 
        src="${c.imagem ? `/uploads/${c.imagem}` : '/imagens/sem-imagem.png'}"
        alt="Imagem da doação"
      >

      <div class="info">
        <span class="status">Em andamento</span>
        <h4>${c.nome_material} - ${c.quantidade} unidades</h4>

        <p><strong>Quem vai coletar:</strong> ${c.solicitante_nome}</p>

        <a 
          href="https://wa.me/55${telefone}?text=${mensagemWhatsApp('doador', c)}"
          target="_blank"
          class="btn whatsapp"
        >
          Falar com o Coletor
        </a>

        <button 
          class="btn verde"
          onclick="concluirColeta(${c.solicitacao_id})"
        >
          Concluir Coleta
        </button>

        <button
  class="btn vermelho"
  onclick="cancelarColeta(${c.solicitacao_id})"
>
  Cancelar Solicitação
</button>

      </div>
    </div>
  `;
}

/* =========================
   CARD — SOLICITANTE
========================= */
function cardSolicitante(c) {
  const telefone = limparTelefone(c.doador_telefone);

  return `
    <div class="card coleta">
      <img 
        src="${c.imagem ? `/uploads/${c.imagem}` : '/imagens/sem-imagem.png'}"
        alt="Imagem da doação"
      >

      <div class="info">
        <span class="status">Em andamento</span>
        <h4>${c.nome_material} - ${c.quantidade} unidades</h4>

        <a 
          href="https://wa.me/55${telefone}?text=${mensagemWhatsApp('solicitante', c)}"
          target="_blank"
          class="btn whatsapp"
        >
          Falar com o Doador
        </a>
      </div>
    </div>
  `;
}

/* =========================
   CONCLUIR COLETA (DOADOR)
========================= */
exports.concluirColeta = async (req, res) => {
  try {
    console.log('➡️ concluirColeta chamada');

    const solicitacaoId = Number(req.params.id);
    const usuario = req.usuario;

    console.log('ID Solicitação:', solicitacaoId);
    console.log('Usuário logado:', usuario);

    if (!usuario || !usuario.id) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    if (!solicitacaoId) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const [rows] = await db.query(
      'SELECT id, doador_id, status FROM solicitacoes_coleta WHERE id = ?',
      [solicitacaoId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Solicitação não encontrada' });
    }

    const solicitacao = rows[0];

    if (solicitacao.doador_id !== usuario.id) {
      return res.status(403).json({
        erro: 'Apenas o doador pode concluir a coleta'
      });
    }

    if (solicitacao.status !== 'confirmada') {
      return res.status(400).json({
        erro: 'A coleta ainda não está confirmada'
      });
    }

    await db.query(
      'UPDATE solicitacoes_coleta SET status = "concluida" WHERE id = ?',
      [solicitacaoId]
    );

    // pontos (começa do zero e soma)
    const PONTOS_POR_COLETA = 20;

    await db.query(
      'UPDATE usuarios SET pontos = pontos + ? WHERE id = ?',
      [PONTOS_POR_COLETA, usuario.id]
    );

    console.log('✅ Coleta concluída com sucesso');

    res.json({ sucesso: true });

  } catch (err) {
    console.error('🔥 ERRO REAL concluirColeta:', err);
    res.status(500).json({ erro: 'Erro interno ao concluir coleta' });
  }
};

/* =========================
   UTILITÁRIOS
========================= */
function limparTelefone(telefone) {
  if (!telefone) return '';
  return telefone.replace(/\D/g, '');
}

function mensagemWhatsApp(tipo, c) {
  let mensagem = '';
  let nomeDestino = '';

  if (tipo === 'doador') {
    nomeDestino = c.solicitante_nome;
    mensagem = `
Olá, ${nomeDestino}

Sou o responsável pela doação do seguinte material:

Material: ${c.nome_material}
Quantidade: ${c.quantidade} unidades

A coleta foi confirmada e estou disponível para combinarmos os próximos passos.
`;
  }

  if (tipo === 'solicitante') {
    nomeDestino = c.doador_nome;
    mensagem = `
Olá, ${nomeDestino}

Estou entrando em contato a respeito da solicitação de coleta do seguinte material:

Material: ${c.nome_material}
Quantidade: ${c.quantidade} unidades

Fico à disposição para alinharmos os detalhes da retirada.
`;
  }

  return encodeURIComponent(mensagem.trim());
}
async function cancelarColeta(id) {
  if (!confirm('Deseja cancelar esta solicitação?')) return;

  const res = await fetch(`/coletas/cancelar/${id}`, {
    method: 'PUT'
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || 'Erro ao cancelar');
    return;
  }

  alert('Solicitação cancelada');
  carregarColetas();
}
