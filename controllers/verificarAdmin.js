module.exports = (req, res, next) => {

  // admin fixo (token com tipo admin)
  if (req.usuario && req.usuario.tipo === 'admin') {
    return next();
  }

  return res.status(403).json({ erro: 'Acesso restrito' });
};