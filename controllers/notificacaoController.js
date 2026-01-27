const db = require('../models/db');

exports.criarNotificacao = async (usuario_id, tipo, mensagem) => {
  await db.query(
    'INSERT INTO notificacoes (usuario_id, tipo, mensagem) VALUES (?, ?, ?)',
    [usuario_id, tipo, mensagem]
  );
};
