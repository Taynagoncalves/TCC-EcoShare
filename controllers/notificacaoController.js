const db = require('../models/db');

// usada internamente pelo sistema para criar uma notificação para um usuário
exports.criarNotificacao = async (usuario_id, tipo, mensagem) => {

  // verifica se o usuario deixou notificações ligadas
  const [[pref]] = await db.query(
    'SELECT notificacoes_ativas FROM usuarios WHERE id = ?',
    [usuario_id]
  );

  // se ele desativou, simplesmente não salva nada
  if (pref && pref.notificacoes_ativas === 0) {
    return;
  }

  // salva a notificação no banco
  await db.query(
    'INSERT INTO notificacoes (usuario_id, tipo, mensagem) VALUES (?, ?, ?)',
    [usuario_id, tipo, mensagem]
  );
};


// rota que retorna as notificações do usuário logado
exports.listar = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // pega as 20 mais recentes
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