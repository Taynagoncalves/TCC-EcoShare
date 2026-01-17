const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ autenticado: true });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};
