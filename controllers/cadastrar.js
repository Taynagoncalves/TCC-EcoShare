const bcrypt = require('bcryptjs');
const db = require('../models/db');

module.exports = async (req, res) => {
  let {
    nome,
    email,
    telefone,
    senha,
    data_nascimento,
    cep,
    endereco,
    numero,
    complemento
  } = req.body;

  try {
    // normalizar telefone (remove máscara)
    telefone = String(telefone || "").replace(/\D/g, "");

    if (!telefone) {
      return res.status(400).json({ error: "Telefone inválido" });
    }

    // (opcional) valida tamanho Brasil: 10 ou 11 dígitos
    if (telefone.length !== 10 && telefone.length !== 11) {
      return res.status(400).json({ error: "Telefone deve ter 10 ou 11 dígitos" });
    }

    // checar duplicidade de telefone
    const [rowsTel] = await db.execute(
      "SELECT id FROM usuarios WHERE telefone = ? LIMIT 1",
      [telefone]
    );

    if (rowsTel.length > 0) {
      return res.status(400).json({ error: "Telefone já cadastrado" });
    }

    // checar duplicidade de email (pra manter mensagem certa)
    const [rowsEmail] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    if (rowsEmail.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await db.execute(
      `INSERT INTO usuarios
      (nome, email, telefone, senha, data_nascimento, cep, endereco, numero, complemento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, telefone, senhaHash, data_nascimento, cep, endereco, numero, complemento]
    );

    return res.json({ message: 'Cadastro realizado com sucesso' });

  } catch (err) {
    // fallback: se tiver UNIQUE no banco e cair aqui
    const msg = String(err?.message || "");

    if (msg.includes("Duplicate") && msg.includes("telefone")) {
      return res.status(400).json({ error: "Telefone já cadastrado" });
    }
    if (msg.includes("Duplicate") && msg.includes("email")) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    return res.status(500).json({ error: "Erro ao cadastrar" });
  }
};