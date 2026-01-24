const db = require('../models/db');

/* =========================
   BUSCAR PONTOS
========================= */
exports.buscarPontos = async (req, res) => {
  try {
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    res.json({ pontos: usuario.pontos || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pontos' });
  }
};

/* =========================
   DEBITAR PONTOS
========================= */
exports.debitarPontos = async (req, res) => {
  try {
    const { pontos } = req.body;

    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [pontos, req.usuario.id]
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao debitar pontos' });
  }
};

/* =========================
   DADOS DO USUÁRIO
========================= */
exports.me = async (req, res) => {
  try {
    const [[usuario]] = await db.query(
      `
      SELECT id, nome, email, telefone, tipo, pontos
      FROM usuarios
      WHERE id = ?
      `,
      [req.usuario.id]
    );

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
};

/* =========================
   RESGATAR CUPOM (🔥 ESSENCIAL)
========================= */
exports.resgatarCupom = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { loja_id } = req.body;

    if (!loja_id) {
      return res.status(400).json({ erro: 'Loja inválida' });
    }

    // Usuário
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    // Loja
    const [[loja]] = await db.query(
      'SELECT * FROM lojas WHERE id = ?',
      [loja_id]
    );

    if (!loja) {
      return res.status(404).json({ erro: 'Loja não encontrada' });
    }

    if (usuario.pontos < loja.pontos_necessarios) {
      return res.status(400).json({
        erro: 'Pontos insuficientes'
      });
    }

    // Verifica se já resgatou
    const [[jaResgatou]] = await db.query(
      'SELECT id FROM cupons_resgatados WHERE usuario_id = ? AND loja_id = ?',
      [usuarioId, loja_id]
    );

    if (jaResgatou) {
      return res.status(400).json({
        erro: 'Cupom já resgatado'
      });
    }

    // Gera código
    const codigo =
      loja.nome.charAt(0).toUpperCase() +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    // Salva cupom
    await db.query(
      `INSERT INTO cupons_resgatados (usuario_id, loja_id, codigo)
       VALUES (?, ?, ?)`,
      [usuarioId, loja_id, codigo]
    );

    // Debita pontos
    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [loja.pontos_necessarios, usuarioId]
    );

    res.json({ sucesso: true, codigo });

  } catch (err) {
    console.error('ERRO RESGATE:', err);
    res.status(500).json({ erro: 'Erro interno ao resgatar cupom' });
  }
};
