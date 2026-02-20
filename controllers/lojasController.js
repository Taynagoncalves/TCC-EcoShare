const db = require('../models/db');

/* lista todas as lojas cadastradas */
exports.listarLojas = async (req, res) => {
  try {
    // busca tudo da tabela lojas
    const [rows] = await db.query('SELECT * FROM lojas');
    res.json(rows);
  } catch (err) {
    console.error('ERRO AO LISTAR LOJAS:', err);
    res.status(500).json({ erro: 'Erro ao listar lojas' });
  }
};


/* cria uma nova loja no sistema (só admin usa) */
exports.criarLoja = async (req, res) => {
  try {
    const {
      nome,
      categoria,
      descricao,
      pontos,
      endereco
    } = req.body;

    // pega imagem enviada
    const imagem = req.file ? req.file.filename : null;

    // valida campos obrigatórios
    if (!nome || !pontos) {
      return res.status(400).json({
        erro: 'Nome e pontos são obrigatórios'
      });
    }

    // salva a loja no banco
    await db.query(
      `INSERT INTO lojas
      (nome, categoria, descricao, pontos, endereco, imagem)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nome,
        categoria || null,
        descricao || null,
        Number(pontos),
        endereco || null,
        imagem
      ]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('ERRO AO CRIAR LOJA:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar loja' });
  }
};


/* remove uma loja do sistema (admin) */
exports.excluirLoja = async (req, res) => {
  try {
    const { id } = req.params;

    // primeiro remove todos os resgates ligados a essa loja
    await db.query(
      'DELETE FROM resgates WHERE loja_id = ?',
      [id]
    );

    // essa parte repete a mesma coisa, serve pra garantir que não fique nada vinculado
    await db.query(
      'DELETE FROM resgates WHERE loja_id = ?',
      [id]
    );

    // depois apaga a loja
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