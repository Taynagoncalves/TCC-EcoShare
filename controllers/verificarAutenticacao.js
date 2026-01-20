module.exports = (req, res, next) => {
  if (!req.cookies || !req.cookies.usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado' });
  }

  try {
    const usuario = req.cookies.usuario;

    if (!usuario.id) {
      return res.status(401).json({ erro: 'Sessão inválida' });
    }

    // 🔥 deixa disponível para os controllers
    req.usuario = {
      id: usuario.id,
      nome: usuario.nome
    };

    next();
  } catch (error) {
    console.error('Erro autenticação:', error);
    return res.status(401).json({ erro: 'Erro de autenticação' });
  }
};
