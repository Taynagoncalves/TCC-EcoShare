const db = require('../models/db');

/* =========================
   RESGATAR CUPOM
========================= */
exports.resgatarCupom = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const loja_id = Number(req.body.loja_id);

    /* valida id da loja */
    if (!loja_id || isNaN(loja_id)) {
      return res.status(400).json({
        ok: false,
        erro: 'loja inválida'
      });
    }

    /* busca usuário */
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        erro: 'usuário não encontrado'
      });
    }

    /* busca loja */
    const [[loja]] = await db.query(
      'SELECT nome, pontos FROM lojas WHERE id = ?',
      [loja_id]
    );

    if (!loja || loja.pontos == null) {
      return res.status(400).json({
        ok: false,
        erro: 'cupom inválido ou sem pontos definidos'
      });
    }

    const pontosUsuario = Number(usuario.pontos);
    const custo = Number(loja.pontos);

    /* bloqueia custo inválido */
    if (isNaN(custo) || custo <= 0) {
      return res.status(400).json({
        ok: false,
        erro: 'valor do cupom inválido'
      });
    }

    /* bloqueia saldo insuficiente */
    if (pontosUsuario < custo) {
      return res.status(400).json({
        ok: false,
        erro: 'pontos insuficientes'
      });
    }

    /* verifica se já resgatou */
    const [[existe]] = await db.query(
      'SELECT id FROM resgates WHERE usuario_id = ? AND loja_id = ?',
      [usuarioId, loja_id]
    );

    if (existe) {
      return res.status(400).json({
        ok: false,
        erro: 'cupom já resgatado'
      });
    }

    /* gera código do cupom (3 letras da loja + sufixo aleatório) */
    const prefixo = loja.nome
      .trim()
      .substring(0, 3)
      .toUpperCase();

    const sufixo = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    const codigo = `${prefixo}-${sufixo}`;

    /* desconta os pontos do usuário */
    await db.query(
      `
      UPDATE usuarios
      SET pontos = pontos - ?
      WHERE id = ?
      `,
      [custo, usuarioId]
    );

    /* registra o resgate */
    await db.query(
      `
      INSERT INTO resgates 
        (usuario_id, loja_id, pontos_usados, codigo, usado)
      VALUES (?, ?, ?, ?, 0)
      `,
      [usuarioId, loja_id, custo, codigo]
    );

    /* sucesso */
    return res.json({
      ok: true,
      codigo,
      pontos_restantes: pontosUsuario - custo
    });

  } catch (err) {
    console.error('Erro ao resgatar cupom:', err);
    return res.status(500).json({
      ok: false,
      erro: 'erro interno ao resgatar cupom'
    });
  }
};
exports.meusCupons = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

const [rows] = await db.query(`
  SELECT
    r.id,
    r.codigo,
    r.pontos_usados,
    r.usado,
    l.nome AS loja_nome,
    l.endereco AS loja_endereco
  FROM resgates r
  JOIN lojas l ON l.id = r.loja_id
  WHERE r.usuario_id = ?
  ORDER BY r.id DESC
`, [usuarioId]);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar cupons:', err);
    res.status(500).json({
      erro: 'Erro ao buscar cupons'
    });
  }
};
