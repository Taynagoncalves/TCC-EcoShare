const db = require('../models/db');

/* =========================
   BUSCAR PONTOS DO USUÁRIO
========================= */
exports.buscarPontos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    res.json({ pontos: usuario.pontos });
  } catch (err) {
    console.error('ERRO AO BUSCAR PONTOS:', err);
    res.status(500).json({ erro: 'Erro ao buscar pontos' });
  }
};

/* =========================
   DEBITAR PONTOS (RESGATE)
========================= */
exports.debitarPontos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { custo } = req.body;

    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.pontos < custo) {
      return res.status(400).json({
        erro: 'Pontos insuficientes'
      });
    }

    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [custo, usuarioId]
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error('ERRO AO DEBITAR PONTOS:', err);
    res.status(500).json({ erro: 'Erro ao debitar pontos' });
  }
};
exports.me = (req, res) => {
  res.json({
    id: req.usuario.id,
    nome: req.usuario.nome,
    tipo: req.usuario.tipo,
    pontos: req.usuario.pontos
  });
};
