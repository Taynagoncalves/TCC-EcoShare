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
  bairro,
  cidade,
  estado,
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

    // validar data brasileira corretamente
    function parseDataBR(dataStr){
      if(!/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) return null;

      if(!data_nascimento || !/^\d{2}\/\d{2}\/\d{4}$/.test(data_nascimento)){
      return res.status(400).json({ error:"Data de nascimento inválida" });
}

       const [dia,mes,ano] = data_nascimento.split("/");
       data_nascimento = `${ano}-${mes}-${dia}`;

      if(ano < 1900 || ano > new Date().getFullYear()) return null;
      if(mes < 1 || mes > 12) return null;
      if(dia < 1 || dia > 31) return null;

      const data = new Date(ano, mes-1, dia);

      if(data.getFullYear() !== ano || data.getMonth() !== mes-1 || data.getDate() !== dia)
        return null;

      return data;
    }

   
    // converter para formato mysql
    const [dia,mes,ano] = data_nascimento.split("/");
    data_nascimento = `${ano}-${mes}-${dia}`;

    // bloquear números falsos / fraude
    function telefoneSuspeito(tel){

      if (/^(\d)\1+$/.test(tel)) return true;
      if ("01234567890123456789".includes(tel)) return true;
      if ("98765432109876543210".includes(tel)) return true;

      const unicos = new Set(tel.split(""));
      if (unicos.size < 4) return true;

      const ddd = tel.substring(0,2);
      const dddsValidos = [
        "11","12","13","14","15","16","17","18","19",
        "21","22","24","27","28",
        "31","32","33","34","35","37","38",
        "41","42","43","44","45","46",
        "47","48","49",
        "51","53","54","55",
        "61","62","63","64","65","66","67","68","69",
        "71","73","74","75","77","79",
        "81","82","83","84","85","86","87","88","89",
        "91","92","93","94","95","96","97","98","99"
      ];

      if (!dddsValidos.includes(ddd)) return true;

      return false;
    }

    if (telefoneSuspeito(telefone)){
      return res.status(400).json({ error: "Telefone inválido ou suspeito" });
    }

     // validar CEP cascavel
const cepLimpo = String(cep || "").replace(/\D/g, "");
if (!cepLimpo || cepLimpo.length !== 8) {
  return res.status(400).json({ error: "CEP inválido" });
}

let data;
try {
  data = await viaCep(cepLimpo);
} catch (e) {
  return res.status(400).json({ error: "Não foi possível consultar o CEP" });
}

if (!data || data.erro)
  return res.status(400).json({ error: "CEP inválido" });

if (data.localidade !== "Cascavel" || data.uf !== "PR") {
  return res.status(400).json({ error: "Cadastro permitido apenas para Cascavel - PR" });
}

// usa endereço oficial do correio
endereco = data.logradouro || endereco;
bairro   = data.bairro || bairro;
cidade   = data.localidade || cidade;
estado   = data.uf || estado;

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

   await db.execute(
  `INSERT INTO usuarios
  (nome, email, telefone, senha, data_nascimento, cep, endereco, bairro, cidade, estado, numero, complemento)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    nome,
    email,
    telefone,
    senhaHash,
    data_nascimento,
    cepLimpo,
    endereco,
    bairro,
    cidade,
    estado,
    numero,
    complemento
  ]
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
