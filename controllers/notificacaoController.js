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