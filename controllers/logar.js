const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  const [usuarios] = await db.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );

  if (usuarios.length === 0) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }

  const usuario = usuarios[0];

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }

  const token = jwt.sign(
    { id: usuario.id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // 🔥 PARTE MAIS IMPORTANTE
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax'
  });

  res.json({
    sucesso: true
  });
};
