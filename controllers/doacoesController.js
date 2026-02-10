const db = require('../models/db');
const fs = require('fs');
const path = require('path');

/* =========================
   CRIAR DOAÇÃO
========================= */
exports.criarDoacao = async (req, res) => {
  try {
    let {
      nome_material,
      quantidade,
      tipo_material,
      descricao,
      bairro_id,
      dias_semana,
      horarios
    } = req.body;

    // valida nome do material
    if (!nome_material || nome_material.trim().length === 0) {
      return res.status(400).json({ erro: 'nome do material inválido' });
    }

    // normaliza
    nome_material = nome_material.trim();


    const usuario_id = req.usuario.id;
    const imagem = req.file ? req.file.filename : null;

    await db.query(`
      INSERT INTO doacoes
      (nome_material, quantidade, tipo_material, descricao,
       bairro_id, dias_semana, horarios, imagem, status, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo', ?)
    `, [
      nome_material,
      quantidade,
      tipo_material,
      descricao || null,
      bairro_id,
      dias_semana || null,
      horarios || null,
      imagem,
      usuario_id
    ]);

    res.json({ sucesso: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'erro ao criar doação' });
  }
};

/* =========================
   LISTAR HOME
========================= */
exports.listarDoacoes = async (req, res) => {
  const [rows] = await db.query(`
    SELECT d.id, d.nome_material, d.quantidade,
           d.tipo_material, d.imagem,
           b.nome AS bairro
    FROM doacoes d
    LEFT JOIN bairros b ON b.id = d.bairro_id
    WHERE d.status = 'ativo'
  `);

  res.json(rows);
};

/* =========================
   DETALHES
========================= */
exports.detalhesDoacao = async (req, res) => {
  const [rows] = await db.query(`
    SELECT d.*, b.nome AS bairro, u.nome AS usuario
    FROM doacoes d
    LEFT JOIN bairros b ON b.id = d.bairro_id
    LEFT JOIN usuarios u ON u.id = d.usuario_id
    WHERE d.id = ?
  `, [req.params.id]);

  if (!rows.length) {
    return res.status(404).json({ erro: 'doação não encontrada' });
  }

  res.json(rows[0]);
};

/* =========================
   MINHAS DOAÇÕES
========================= */
exports.minhasDoacoes = async (req, res) => {
  const [rows] = await db.query(`
    SELECT id, nome_material, quantidade, status, imagem
    FROM doacoes
    WHERE usuario_id = ?
  `, [req.usuario.id]);

  res.json(rows);
};

/* =========================
   BUSCAR PARA EDIÇÃO
========================= */
exports.buscarParaEdicao = async (req, res) => {
  const [rows] = await db.query(`
    SELECT *
    FROM doacoes
    WHERE id = ? AND usuario_id = ?
  `, [req.params.id, req.usuario.id]);

  if (!rows.length) {
    return res.status(404).json({ erro: 'não encontrada' });
  }

  res.json(rows[0]);
};

/* =========================
   EDITAR DOAÇÃO
========================= */
exports.editarDoacao = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario_id = req.usuario.id;

    const [[atual]] = await db.query(
      'SELECT imagem FROM doacoes WHERE id=? AND usuario_id=?',
      [id, usuario_id]
    );

    if (!atual) {
      return res.status(403).json({ erro: 'sem permissão' });
    }

    const imagem = req.file ? req.file.filename : atual.imagem;

    await db.query(`
      UPDATE doacoes SET
        nome_material=?,
        quantidade=?,
        tipo_material=?,
        descricao=?,
        bairro_id=?,
        dias_semana=?,
        horarios=?,
        imagem=?
      WHERE id=? AND usuario_id=?
    `, [
      req.body.nome_material,
      req.body.quantidade,
      req.body.tipo_material,
      req.body.descricao || null,
      req.body.bairro_id,
      req.body.dias_semana || null,
      req.body.horarios || null,
      imagem,
      id,
      usuario_id
    ]);

    res.json({ sucesso: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'erro ao editar' });
  }
};

/* =========================
   EXCLUIR
========================= */
exports.excluirDoacao = async (req, res) => {
  await db.query(
    'DELETE FROM solicitacoes_coleta WHERE doacao_id=?',
    [req.params.id]
  );

  await db.query(
    'DELETE FROM doacoes WHERE id=? AND usuario_id=?',
    [req.params.id, req.usuario.id]
  );

  res.json({ sucesso: true });
};

/* =========================
   ADMIN
========================= */
exports.listarTodasAdmin = async (req, res) => {
  const [rows] = await db.query(`
    SELECT d.id, d.nome_material, d.quantidade,
           d.status, u.nome AS usuario_nome
    FROM doacoes d
    JOIN usuarios u ON u.id=d.usuario_id
    ORDER BY d.id DESC
  `);

  res.json(rows);
};

exports.removerAdmin = async (req, res) => {
  await db.query(
    'DELETE FROM solicitacoes_coleta WHERE doacao_id=?',
    [req.params.id]
  );

  await db.query(
    'DELETE FROM doacoes WHERE id=?',
    [req.params.id]
  );

  res.json({ sucesso: true });
};