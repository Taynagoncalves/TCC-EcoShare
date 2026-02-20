const jwt = require('jsonwebtoken');
const db = require('../models/db');

module.exports = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ADMIN FIXO 
    if (decoded.tipo === "admin") {
      req.usuario = {
        id: 0,
        nome: "Administrador",
        tipo: "admin",
        pontos: 0,
        status: "ativo"
      };
      return next();
    }

    // USUÁRIO NORMAL 
    const [rows] = await db.query(
      'SELECT id, nome, tipo, pontos, status FROM usuarios WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    if (rows[0].status === 'bloqueado') {
      return res.status(403).json({
        erro: 'Usuário bloqueado'
      });
    }

    req.usuario = rows[0];
    next();

  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};