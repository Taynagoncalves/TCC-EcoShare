const db = require("../models/db");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

module.exports = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    //  Sempre responde igual (segurança)
    if (rows.length === 0) {
      return res.json({
        message: "Se o e-mail existir, você receberá o link."
      });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.execute(
      "UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expires, email]
    );

    // LINK (string template)
    const link = `http://localhost:8000/redefinir-senha?token=${token}`;

    // RESPONDE IMEDIATAMENTE (UX PERFEITA)
    res.json({
      message: "Se o e-mail existir, você receberá o link."
    });

    //  ENVIO DO EMAIL EM SEGUNDO PLANO
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"EcoShare" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Redefinição de Senha - EcoShare",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          background:#ffffff;
          padding:20px;
          text-align:center;
        ">

          <img 
            src="cid:logoEco"
            alt="EcoShare"
            style="width:90px; margin-bottom:10px;"
          />

          <h2 style="
            color:#1f4d2b;
            margin:10px 0;
          ">
            Redefinição de Senha
          </h2>

          <img 
            src="cid:cadeadoEco"
            alt="Redefinir senha"
            style="width:200px; margin:10px 0;"
          />

          <p style="
            font-size:15px;
            color:#333;
            line-height:1.4;
          ">
            Você solicitou a redefinição da sua senha no <strong>EcoShare</strong>.
            <br>
            Clique no botão abaixo para criar uma nova senha.
          </p>

          <a href="${link}"
            style="
              display:inline-block;
              margin:15px 0;
              padding:14px 32px;
              background:#2f7d3a;
              color:#ffffff;
              text-decoration:none;
              border-radius:30px;
              font-size:16px;
              font-weight:bold;
            ">
            Redefinir Senha
          </a>

          <p style="
            font-size:12px;
            color:#777;
            margin-top:10px;
          ">
            Este link expira em 1 hora.
            <br>
            Se você não solicitou essa alteração, ignore este e-mail.
          </p>

        </div>
      `,

      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "..", "src", "imagens", "logo.png"),
          cid: "logoEco"
        },
        {
          filename: "cadeado.png",
          path: path.join(
            __dirname,
            "..",
            "src",
            "imagens",
            "cadeado-redefinir-senha.png"
          ),
          cid: "cadeadoEco"
        }
      ]
    });

    console.log(" Email de redefinição enviado com sucesso");
  } catch (err) {
    console.error(" ERRO GERAL:", err);
  }
};
