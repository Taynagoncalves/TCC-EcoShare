const bcrypt = require('bcryptjs');
const db = require('../models/db');

module.exports = async (req, res) => {
  const {
    nome,
    email,
    senha,
    data_nascimento,
    cep,
    endereco,
    numero,
    complemento
  } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    await db.execute(
      `INSERT INTO usuarios 
       (nome, email, senha, data_nascimento, cep, endereco, numero, complemento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, senhaHash, data_nascimento, cep, endereco, numero, complemento]
    );

    res.json({ message: 'Cadastro realizado com sucesso' });

  } catch (err) {
    res.status(400).json({ error: 'Email já cadastrado' });
  }
};
