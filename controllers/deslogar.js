module.exports = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout realizado' });
};
