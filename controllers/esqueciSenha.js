const db = require("../models/db");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// cria a conexão com o gmail para poder enviar emails
// usa variáveis de ambiente pra não deixar senha no código
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  // configurações pra não abrir conexão toda hora e ficar mais rápido
  pool: true,
  maxConnections: 5,
  maxMessages: 100,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// rota de esqueci minha senha
module.exports = async (req, res) => {
  try {
    const { email } = req.body;

    // procura usuario com esse email
    const [rows] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    // sempre retorna a mesma resposta
    // isso evita alguém descobrir quais emails existem no sistema
    if (rows.length === 0) {
      return res.json({
        message: "Se o e-mail existir, você receberá o link."
      });
    }

    // cria um token unico para resetar a senha
    const token = uuidv4();

    // define validade de 1 hora
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // salva token e validade no banco
    await db.execute(
      "UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expires, email]
    );

    // link que o usuario vai clicar no email
    const link = `http://localhost:8000/redefinir-senha?token=${token}`;

    // responde rápido pro usuário não ficar esperando email enviar
    res.json({
      message: "Se o e-mail existir, você receberá o link."
    });

    // envia o email depois, em segundo plano
    setImmediate(async () => {
      try {

        await transporter.sendMail({
          from: `"EcoShare" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Redefinição de senha - EcoShare",

          // corpo do email com botão clicável
          html: `
          <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:40px">
            <div style="max-width:480px;margin:auto;background:white;border-radius:14px;padding:30px;text-align:center">

              <h2 style="color:#2e7d32;margin-bottom:10px">
                Redefinição de senha
              </h2>

              <p style="color:#555;font-size:15px;margin-bottom:25px">
                Recebemos uma solicitação para redefinir sua senha.
              </p>

              <a href="${link}"
                 style="
                  display:inline-block;
                  background:#2e7d32;
                  color:white;
                  padding:14px 28px;
                  border-radius:8px;
                  text-decoration:none;
                  font-weight:bold;
                  font-size:16px;">
                Redefinir senha
              </a>

              <p style="margin-top:25px;font-size:13px;color:#777">
                Este link expira em 1 hora.<br>
                Se você não solicitou a alteração, ignore este email.
              </p>

            </div>
          </div>
          `
        });

        // log só pra saber que enviou
        console.log("Email de redefinição enviado");

      } catch (e) {
        // erro no envio não quebra o sistema
        console.error("Erro ao enviar email:", e);
      }
    });

  } catch (err) {
    console.error("ERRO GERAL:", err);
  }
};