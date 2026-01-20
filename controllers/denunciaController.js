const nodemailer = require('nodemailer');

exports.enviarDenuncia = async (req, res) => {
  const { mensagem, doacaoId } = req.body;

  if (!mensagem) {
    return res.status(400).json({ erro: 'Mensagem obrigatória' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ecoshare.reciclaveis@gmail.com',
        pass: 'irjercpttxjnezyn'
      }
    });

    await transporter.sendMail({
      from: '"EcoShare" <ecoshare.reciclaveis@gmail.com>',
      to: 'ecoshare.reciclaveis@gmail.com',
      subject: 'Denúncia de Doação - EcoShare',
      text: `
Denúncia recebida

ID da Doação: ${doacaoId || 'Não informado'}

Mensagem:
${mensagem}
      `
    });

    res.json({ sucesso: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao enviar denúncia' });
  }
};
