const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models/db');

module.exports = async (req, res) => {
  const { email, senha } = req.body;

  const [rows] = await db.execute(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }

  const usuario = rows[0];
  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 3600000
  });

  res.json({ message: 'Login realizado com sucesso' });
};
