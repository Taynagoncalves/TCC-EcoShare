const db = require('../models/db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT id, nome, senha FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha);

    if (!senhaOk) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    // 🔥 COOKIE CORRETO
    res.cookie(
      'usuario',
      {
        id: usuario.id,
        nome: usuario.nome
      },
      {
        httpOnly: true
      }
    );

    res.json({ sucesso: true });

  } catch (error) {
    console.error('Erro login:', error);
    res.status(500).json({ erro: 'Erro no login' });
  }
};
