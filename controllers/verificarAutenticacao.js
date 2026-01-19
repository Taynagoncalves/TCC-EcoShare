const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ISSO É O QUE FAZ "MINHAS PUBLICAÇÕES" FUNCIONAR
    req.user = decoded;

    next();
  } catch (error) {
    return res.redirect('/login');
  }
};
