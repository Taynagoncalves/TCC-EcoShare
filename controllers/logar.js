const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// rota de login
module.exports = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // login  do admin 
    const ADMIN_EMAIL = "admin@ecoshare.com";
    const ADMIN_SENHA = "63472943";

    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {

      // cria token marcando que é admin
      const token = jwt.sign(
        { id: 0, tipo: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // salva token no cookie
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax'
      });

      return res.json({ sucesso: true, admin: true });
    }

    // procura usuario pelo email
    const [[usuario]] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    // se não existir
    if (!usuario) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      });
    }

    // verifica se está bloqueado, suspenso ou banido
    if (usuario.status === 'bloqueado') {

      if (usuario.bloqueado_ate) {

        const dataBloqueio = new Date(usuario.bloqueado_ate);
        const agora = new Date();

        // ano 9999 significa ban permanente
        if (dataBloqueio.getFullYear() >= 9999) {
          return res.status(403).json({
            erro: 'Conta banida',
            motivo: usuario.motivo_bloqueio
          });
        }

        // ainda está dentro do tempo de suspensão
        if (dataBloqueio > agora) {
          return res.status(403).json({
            erro: 'Conta suspensa',
            motivo: usuario.motivo_bloqueio,
            ate: usuario.bloqueado_ate
          });
        }
      }

      // tempo passou então desbloqueia automaticamente
      await db.query(`
        UPDATE usuarios
        SET status='ativo', bloqueado_ate=NULL, motivo_bloqueio=NULL
        WHERE id=?
      `,[usuario.id]);
    }

    // compara senha digitada com a senha criptografada do banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos'
      });
    }

    // cria token normal do usuario
    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // salva token no navegador
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