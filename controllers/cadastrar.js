const bcrypt = require('bcryptjs');
const db = require('../models/db');
const https = require('https');

function viaCep(cepLimpo) {
  return new Promise((resolve, reject) => {
    https.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, (resp) => {
      let data = "";
      resp.on("data", (chunk) => (data += chunk));
      resp.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

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
    // senha mínimo 6
    if (!senha || String(senha).length < 6) {
      return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres." });
    }

    // normalizar telefone
    telefone = String(telefone || "").replace(/\D/g, "");
    if (!telefone) return res.status(400).json({ error: "Telefone inválido" });
    if (telefone.length !== 10 && telefone.length !== 11) {
      return res.status(400).json({ error: "Telefone deve ter 10 ou 11 dígitos" });
    }

    // validar CEP cascavel
    const cepLimpo = String(cep || "").replace(/\D/g, "");
    if (!cepLimpo || cepLimpo.length !== 8) {
      return res.status(400).json({ error: "CEP inválido" });
    }

    const data = await viaCep(cepLimpo);

    if (data.erro) return res.status(400).json({ error: "CEP inválido" });
    if (data.localidade !== "Cascavel" || data.uf !== "PR") {
      return res.status(400).json({ error: "Cadastro permitido apenas para Cascavel - PR" });
    }

    // duplicidade telefone
    const [rowsTel] = await db.execute(
      "SELECT id FROM usuarios WHERE telefone = ? LIMIT 1",
      [telefone]
    );
    if (rowsTel.length > 0) {
      return res.status(400).json({ error: "Telefone já cadastrado" });
    }

    // duplicidade email
    const [rowsEmail] = await db.execute(
      "SELECT id FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );
    if (rowsEmail.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    // ✅ INSERT NO PADRÃO ORIGINAL (sem bairro)
    await db.execute(
      `INSERT INTO usuarios
      (nome, email, telefone, senha, data_nascimento, cep, endereco, numero, complemento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, telefone, senhaHash, data_nascimento, cepLimpo, endereco, numero, complemento]
    );

    return res.json({ message: "Cadastro realizado com sucesso" });

  } catch (err) {
    const msg = String(err?.message || "");

    if (msg.includes("Duplicate") && msg.includes("telefone")) {
      return res.status(400).json({ error: "Telefone já cadastrado" });
    }
    if (msg.includes("Duplicate") && msg.includes("email")) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    console.error(err);
    return res.status(500).json({ error: "Erro ao cadastrar" });
  }
};
