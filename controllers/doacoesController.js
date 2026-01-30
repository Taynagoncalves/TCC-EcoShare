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
      return res.status(401).json({ erro: 'usuário não autenticado' });
    }

    const imagem = req.file ? req.file.filename : null;

    await db.query(
      `
      INSERT INTO doacoes
      (nome_material, quantidade, tipo_material, descricao, bairro_id,
       dias_semana, horarios, imagem, status, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo', ?)
      `,
      [
        nome_material,
        quantidade,
        tipo_material,
        descricao || null,
        bairro_id,
        dias_semana,
        horarios,
        imagem,
        usuario_id
      ]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('erro ao criar doação:', err);
    res.status(500).json({ erro: 'erro ao criar doação' });
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

    const [[doacao]] = await db.query(
      `
      SELECT 
        d.*,
        b.nome AS bairro
      FROM doacoes d
      LEFT JOIN bairros b ON d.bairro_id = b.id
      WHERE d.id = ?
      `,
      [id]
    );

    if (!doacao) {
      return res.status(404).json({ erro: 'doação não encontrada' });
    }

    res.json(doacao);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'erro ao buscar doação' });
  }
};

/* =========================
   BUSCAR DOAÇÃO PARA EDIÇÃO
========================= */
exports.buscarParaEdicao = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const [[doacao]] = await db.query(
      `
      SELECT *
      FROM doacoes
      WHERE id = ? AND usuario_id = ?
      `,
      [id, usuario_id]
    );

    if (!doacao) {
      return res.status(404).json({ erro: 'doação não encontrada' });
    }

    res.json(doacao);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'erro ao buscar doação' });
  }
};

/* =========================
   EDITAR DOAÇÃO
========================= */
exports.editarDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const {
      nome_material,
      quantidade,
      tipo_material,
      descricao,
      bairro_id,
      dias_semana,
      horarios
    } = req.body;

    const [[doacao]] = await db.query(
      'SELECT imagem FROM doacoes WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (!doacao) {
      return res.status(403).json({ erro: 'sem permissão' });
    }

    let imagemFinal = doacao.imagem;

    if (req.file) {
      // remove imagem antiga
      if (doacao.imagem) {
        const caminho = path.join(__dirname, '..', 'uploads', doacao.imagem);
        if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
      }
      imagemFinal = req.file.filename;
    }

    await db.query(
      `
      UPDATE doacoes SET
        nome_material = ?,
        quantidade = ?,
        tipo_material = ?,
        descricao = ?,
        bairro_id = ?,
        dias_semana = ?,
        horarios = ?,
        imagem = ?
      WHERE id = ? AND usuario_id = ?
      `,
      [
        nome_material,
        quantidade,
        tipo_material,
        descricao || null,
        bairro_id,
        dias_semana,
        horarios,
        imagemFinal,
        id,
        usuario_id
      ]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'erro ao editar doação' });
  }
};

/* =========================
   MINHAS DOAÇÕES
========================= */
exports.minhasDoacoes = async (req, res) => {
  const usuario_id = req.usuario.id;

  const [rows] = await db.query(
    `
    SELECT id, nome_material, quantidade, status, imagem
    FROM doacoes
    WHERE usuario_id = ?
    `,
    [usuario_id]
  );

  res.json(rows);
};

/* =========================
   EXCLUIR DOAÇÃO (USUÁRIO)
========================= */
exports.excluirDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const [[doacao]] = await db.query(
      'SELECT imagem FROM doacoes WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (!doacao) {
      return res.status(403).json({ erro: 'sem permissão' });
    }

    await db.query('DELETE FROM solicitacoes_coleta WHERE doacao_id = ?', [id]);
    await db.query('DELETE FROM doacoes WHERE id = ?', [id]);

    if (doacao.imagem) {
      const caminho = path.join(__dirname, '..', 'uploads', doacao.imagem);
      if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
    }

    res.json({ sucesso: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'erro ao excluir doação' });
  }
};

/* =========================
   ADMIN
========================= */
exports.listarTodasAdmin = async (req, res) => {
  const [rows] = await db.query(`
    SELECT d.id, d.nome_material, d.quantidade, d.status, u.nome AS usuario
    FROM doacoes d
    JOIN usuarios u ON u.id = d.usuario_id
    ORDER BY d.id DESC
  `);

  res.json(rows);
};

exports.removerAdmin = async (req, res) => {
  const { id } = req.params;

  const [[doacao]] = await db.query(
    'SELECT imagem FROM doacoes WHERE id = ?',
    [id]
  );

  if (!doacao) {
    return res.status(404).json({ erro: 'doação não encontrada' });
  }

  await db.query('DELETE FROM solicitacoes_coleta WHERE doacao_id = ?', [id]);
  await db.query('DELETE FROM doacoes WHERE id = ?', [id]);

  if (doacao.imagem) {
    const caminho = path.join(__dirname, '..', 'uploads', doacao.imagem);
    if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
  }

  res.json({ sucesso: true });
};
