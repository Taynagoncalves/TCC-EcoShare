const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [[usuario]] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (!usuario) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      });
    }

    // verificação de bloqueio/suspensão/ban
    if (usuario.status === 'bloqueado') {

      if (usuario.bloqueado_ate) {

        const dataBloqueio = new Date(usuario.bloqueado_ate);
        const agora = new Date();

        // ban permanente (9999)
        if (dataBloqueio.getFullYear() >= 9999) {
          return res.status(403).json({
            erro: 'Conta banida',
            motivo: usuario.motivo_bloqueio
          });
        }

        // suspensão ativa
        if (dataBloqueio > agora) {
          return res.status(403).json({
            erro: 'Conta suspensa',
            motivo: usuario.motivo_bloqueio,
            ate: usuario.bloqueado_ate
          });
        }
      }

      // tempo acabou → desbloqueia automaticamente
      await db.query(`
        UPDATE usuarios
        SET status='ativo', bloqueado_ate=NULL, motivo_bloqueio=NULL
        WHERE id=?
      `,[usuario.id]);
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      });
    }

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax'
    });

    res.json({ sucesso: true });

  } catch (err) {
    console.error('ERRO LOGIN:', err);
    res.status(500).json({
      erro: 'Erro ao realizar login'
    });
  }
};
