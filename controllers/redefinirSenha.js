const bcrypt = require('bcryptjs');
const db = require('../models/db');

module.exports = async (req, res) => {
  try {
    const { token, senha } = req.body;

    if (!token || !senha) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const [rows] = await db.execute(
      'SELECT id FROM usuarios WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hash = await bcrypt.hash(senha, 10);

    await db.execute(
      'UPDATE usuarios SET senha = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hash, rows[0].id]
    );

    res.json({ message: 'Senha redefinida com sucesso' });

  } catch (err) {
    console.error('ERRO AO REDEFINIR SENHA:', err);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};
