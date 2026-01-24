const jwt = require('jsonwebtoken');
const db = require('../models/db');

module.exports = async (req, res, next) => {
 const token = req.cookies.token;

if (!token) {
  return res.status(401).json({ erro: 'Não autenticado' });
}


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      'SELECT id, nome, tipo, pontos FROM usuarios WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    // 🔥 ESSA LINHA É A MAIS IMPORTANTE
    req.usuario = rows[0];

    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};
