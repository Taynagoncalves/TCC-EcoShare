const db = require('../models/db');

exports.criarNotificacao = async (usuario_id, tipo, mensagem) => {
  // se o usuário desativou as notificações, não cria no banco
  const [[pref]] = await db.query(
    'SELECT notificacoes_ativas FROM usuarios WHERE id = ?',
    [usuario_id]
  );

  if (pref && pref.notificacoes_ativas === 0) {
    return;
  }

  await db.query(
    'INSERT INTO notificacoes (usuario_id, tipo, mensagem) VALUES (?, ?, ?)',
    [usuario_id, tipo, mensagem]
  );
};

exports.listar = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await db.query(`
      SELECT id, tipo, mensagem, lida, criada_em
      FROM notificacoes
      WHERE usuario_id = ?
      ORDER BY id DESC
      LIMIT 20
    `, [usuarioId]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'erro ao buscar notificacoes' });
  }
};
