const db = require('../models/db');

/* =========================
   CRIAR DOAÇÃO
========================= */
exports.criarDoacao = async (req, res) => {
  try {
    const {
      nome_material,
      quantidade,
      tipo_material,
      bairro_id,
      dias_semana,
      horarios,
      descricao
    } = req.body;

    // USUÁRIO LOGADO
    const usuario_id = req.user.id;

    const imagem = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO doacoes
      (
        nome_material,
        quantidade,
        tipo_material,
        bairro_id,
        dias_semana,
        horarios,
        descricao,
        imagem,
        usuario_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')
    `;

    await db.query(sql, [
      nome_material,
      quantidade,
      tipo_material,
      bairro_id,
      dias_semana,
      horarios,
      descricao,
      imagem,
      usuario_id
    ]);

    res.json({ sucesso: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar doação' });
  }
};

/* =========================
   LISTAR TODAS (HOME)
========================= */
exports.listarDoacoes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.nome_material,
        d.quantidade,
        d.tipo_material,
        d.imagem,
        b.nome AS bairro
      FROM doacoes d
      JOIN bairros b ON d.bairro_id = b.id
      WHERE d.status = 'ativo'
      ORDER BY d.criado_em DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar doações' });
  }
};

/* =========================
   MINHAS PUBLICAÇÕES
========================= */
exports.minhasDoacoes = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const [rows] = await db.query(`
      SELECT 
        id,
        nome_material,
        quantidade,
        status,
        imagem
      FROM doacoes
      WHERE usuario_id = ?
      ORDER BY criado_em DESC
    `, [usuarioId]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar suas doações' });
  }
};
