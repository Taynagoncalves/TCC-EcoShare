const db = require('../models/db');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  try {
    console.log('🚀 ROTA /esqueci-senha CHAMADA');

    const { email } = req.body;

    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      console.log('⚠️ EMAIL NÃO ENCONTRADO:', email);
      return res.json({
        message: 'Se o e-mail existir, você receberá o link.'
      });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.execute(
      'UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE email = ?',
      [token, expires, email]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const link = `http://localhost:8000/redefinir-senha?token=${token}`;

    console.log('📤 ENVIANDO EMAIL PARA:', email);

    await transporter.sendMail({
      from: `"EcoShare" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de Senha - EcoShare',
      html: `
        <p>Você solicitou a redefinição de senha.</p>
        <p>Clique no link abaixo:</p>
        <a href="${link}">${link}</a>
        <p>Este link expira em 1 hora.</p>
      `
    });

    console.log('📧 EMAIL ENVIADO COM SUCESSO');

    res.json({
      message: 'Se o e-mail existir, você receberá o link.'
    });

  } catch (err) {
    console.error('❌ ERRO AO ENVIAR EMAIL:', err);
    res.status(500).json({ error: 'Erro ao enviar e-mail' });
  }
};
