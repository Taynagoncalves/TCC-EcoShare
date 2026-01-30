const db = require('../models/db');
const fs = require('fs');
const path = require('path');

/* =========================
   CRIAR DOAÇÃO
========================= */
exports.criarDoacao = async (req, res) => {
  try {
    const {
      nome_material,
      quantidade,
      tipo_material,
      descricao,
      bairro_id,
      dias_semana,
      horarios
    } = req.body;

    const usuario_id = req.usuario.id;

    if (!usuario_id) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    const imagem = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO doacoes
      (nome_material, quantidade, tipo_material, descricao, bairro_id,
       dias_semana, horarios, imagem, status, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo', ?)`,
      [
        nome_material,
        quantidade,
        tipo_material,
        descricao || null,
        bairro_id,
        dias_semana || null,
        horarios || null,
        imagem,
        usuario_id
      ]
    );

    res.json({ sucesso: true });

  } catch (error) {
    console.error('Erro criar doação:', error);
    res.status(500).json({ erro: 'Erro ao criar doação' });
  }
};

/* =========================
   LISTAR DOAÇÕES (HOME)
========================= */
exports.listarDoacoes = async (req, res) => {
  const [rows] = await db.query(`
    SELECT 
      d.id,
      d.nome_material,
      d.quantidade,
      d.tipo_material,
      d.imagem,
      b.nome AS bairro
    FROM doacoes d
    LEFT JOIN bairros b ON d.bairro_id = b.id
    WHERE d.status = 'ativo'
  `);

  res.json(rows);
};

/* =========================
   DETALHES DA DOAÇÃO
========================= */
exports.detalhesDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.nome_material,
        d.quantidade,
        d.tipo_material,
        d.descricao,
        d.dias_semana,
        d.horarios,
        d.imagem,
        d.status,
        b.nome AS bairro,
        u.nome AS usuario
      FROM doacoes d
      LEFT JOIN bairros b ON d.bairro_id = b.id
      LEFT JOIN usuarios u ON d.usuario_id = u.id
      WHERE d.id = ?
      LIMIT 1
    `, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ erro: 'Doação não encontrada' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Erro detalhes doação:', error);
    res.status(500).json({ erro: 'Erro ao buscar detalhes' });
  }
};

/* =========================
   MINHAS DOAÇÕES
========================= */
exports.minhasDoacoes = async (req, res) => {
  const usuario_id = req.usuario.id;

  const [rows] = await db.query(`
    SELECT 
      id,
      nome_material,
      quantidade,
      status,
      imagem
    FROM doacoes
    WHERE usuario_id = ?
  `, [usuario_id]);

  res.json(rows);
};

/* =========================
   EXCLUIR DOAÇÃO (USUÁRIO)
========================= */
exports.excluirDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const [rows] = await db.query(
      'SELECT imagem FROM doacoes WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        erro: 'Você não tem permissão para excluir esta doação'
      });
    }

    const imagem = rows[0].imagem;

    await db.query(
      'DELETE FROM doacoes WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (imagem) {
      const caminhoImagem = path.join(__dirname, '..', 'uploads', imagem);
      if (fs.existsSync(caminhoImagem)) {
        fs.unlinkSync(caminhoImagem);
      }
    }

    res.json({ sucesso: true });

  } catch (error) {
    console.error('Erro ao excluir doação:', error);
    res.status(500).json({ erro: 'Erro ao excluir doação' });
  }
};

/* =========================
   ADMIN — LISTAR TODAS DOAÇÕES
========================= */
exports.listarTodasAdmin = async (req, res) => {
  try {
    const [doacoes] = await db.query(`
      SELECT 
        d.id,
        d.nome_material,
        d.quantidade,
        d.status,
        u.nome AS usuario_nome
      FROM doacoes d
      JOIN usuarios u ON u.id = d.usuario_id
      ORDER BY d.id DESC
    `);

    res.json(doacoes);
  } catch (err) {
    console.error('ERRO ADMIN DOAÇÕES:', err);
    res.status(500).json({ erro: 'Erro ao listar doações' });
  }
};

/* =========================
   ADMIN — REMOVER DOAÇÃO
========================= */
exports.removerAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // buscar imagem
    const [[doacao]] = await db.query(
      'SELECT imagem FROM doacoes WHERE id = ?',
      [id]
    );

    if (!doacao) {
      return res.status(404).json({ erro: 'Doação não encontrada' });
    }

    //APAGAR DEPENDÊNCIAS
    await db.query(
      'DELETE FROM solicitacoes_coleta WHERE doacao_id = ?',
      [id]
    );

    // APAGAR DOAÇÃO
    await db.query(
      'DELETE FROM doacoes WHERE id = ?',
      [id]
    );

    // APAGAR IMAGEM (SE EXISTIR)
    if (doacao.imagem) {
      const caminhoImagem = path.join(
        __dirname,
        '..',
        'uploads',
        doacao.imagem
      );

      if (fs.existsSync(caminhoImagem)) {
        fs.unlinkSync(caminhoImagem);
      }
    }

    res.json({ sucesso: true });

  } catch (err) {
    console.error('ERRO REMOVER ADMIN:', err);
    res.status(500).json({ erro: 'Erro ao remover doação' });
  }
};
