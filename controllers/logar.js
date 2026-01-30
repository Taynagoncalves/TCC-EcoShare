const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca usuário pelo email
    const [[usuario]] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (!usuario) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      });
    }

    // BLOQUEIO ANTES DO LOGIN
    if (usuario.status === 'bloqueado') {
      return res.status(403).json({
        erro: 'Usuário bloqueado'
      });
    }

    // COMPARAÇÃO CORRETA DA SENHA (bcrypt)
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      });
    }

    // Gera token
    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Salva cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax'
    });

    // Login OK
    res.json({ sucesso: true });

  } catch (err) {
    console.error('ERRO LOGIN:', err);
    res.status(500).json({
      erro: 'Erro ao realizar login'
    });
  }
};
