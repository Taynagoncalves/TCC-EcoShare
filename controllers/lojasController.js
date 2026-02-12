const db = require('../models/db');

/* =========================
   LISTAR LOJAS
========================= */
exports.listarLojas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM lojas');
    res.json(rows);
  } catch (err) {
    console.error('ERRO AO LISTAR LOJAS:', err);
    res.status(500).json({ erro: 'Erro ao listar lojas' });
  }
};

/* =========================
   CRIAR LOJA (ADMIN)
========================= */
exports.criarLoja = async (req, res) => {
  try {
    // multer envia multipart/form-data
    const nome = req.body.nome;
    const descricao = req.body.descricao || null;
    const pontos = Number(req.body.pontos);
    const endereco = req.body.endereco || null;

    const imagem = req.file ? req.file.filename : null;

    // validação
    if (!nome || !pontos || isNaN(pontos)) {
      return res.status(400).json({
        erro: 'Nome e pontos são obrigatórios'
      });
    }

    await db.query(
      `INSERT INTO lojas (nome, descricao, pontos, endereco, imagem)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, descricao, pontos, endereco, imagem]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('ERRO AO CRIAR LOJA:', err);
    res.status(500).json({
      erro: 'Erro interno ao cadastrar loja'
    });
  }
};

/* =========================
   EXCLUIR LOJA (ADMIN)
========================= */
exports.excluirLoja = async (req, res) => {
  try {
    const { id } = req.params;

    // apagar resgates da loja
    await db.query(
      'DELETE FROM resgates WHERE loja_id = ?',
      [id]
    );

    // apagar cupons resgatados da loja (se existir tabela)
    await db.query(
      'DELETE FROM cupons_resgatados WHERE loja_id = ?',
      [id]
    );

    // apagar loja
    await db.query(
      'DELETE FROM lojas WHERE id = ?',
      [id]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('ERRO AO EXCLUIR LOJA:', err);
    res.status(500).json({
      erro: 'Erro ao excluir loja'
    });
  }
};
