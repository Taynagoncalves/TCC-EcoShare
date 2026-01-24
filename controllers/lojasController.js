const db = require('../models/db');

// LISTAR LOJAS
exports.listarLojas = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM lojas');
  res.json(rows);
};

// CRIAR LOJA
exports.criarLoja = async (req, res) => {
  const { nome, descricao, pontos } = req.body;
  const imagem = req.file ? req.file.filename : null;

  await db.query(
    'INSERT INTO lojas (nome, descricao, pontos, imagem) VALUES (?, ?, ?, ?)',
    [nome, descricao, pontos, imagem]
  );

  res.json({ sucesso: true });
};

// EXCLUIR LOJA
exports.excluirLoja = async (req, res) => {
  const { id } = req.params;

  await db.query('DELETE FROM lojas WHERE id = ?', [id]);

  res.json({ sucesso: true });
};
