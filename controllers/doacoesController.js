const db = require('../models/db');
const fs = require('fs');
const path = require('path');

/*  cria uma doação nova no banco */
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

    // verifica se o nome foi enviado vazio
    if (!nome_material || nome_material.trim().length === 0) {
      return res.status(400).json({ erro: 'nome do material inválido' });
    }

    // tira espaços extras do nome
    nome_material = nome_material.trim();

    // pega id do usuario logado
    const usuario_id = req.usuario.id;

    // pega nome da imagem se foi enviada
    const imagem = req.file ? req.file.filename : null;

    // salva a doação no banco com status ativo
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


/* lista as doações que aparecem na home */
exports.listarDoacoes = async (req, res) => {
  // traz apenas doações ativas e junto o nome do bairro
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


/* mostra os detalhes completos de uma doação */
exports.detalhesDoacao = async (req, res) => {
  // busca a doação pelo id junto com bairro e nome do dono
  const [rows] = await db.query(`
    SELECT d.*, b.nome AS bairro, u.nome AS usuario
    FROM doacoes d
    LEFT JOIN bairros b ON b.id = d.bairro_id
    LEFT JOIN usuarios u ON u.id = d.usuario_id
    WHERE d.id = ?
  `, [req.params.id]);

  // se nao existir retorna erro
  if (!rows.length) {
    return res.status(404).json({ erro: 'doação não encontrada' });
  }

  res.json(rows[0]);
};


/* lista somente as doações do usuario logado */
exports.minhasDoacoes = async (req, res) => {
  const [rows] = await db.query(`
    SELECT id, nome_material, quantidade, status, imagem
    FROM doacoes
    WHERE usuario_id = ?
  `, [req.usuario.id]);

  res.json(rows);
};


/* busca dados da doação para preencher o formulario de edição */
exports.buscarParaEdicao = async (req, res) => {
  // garante que a doação pertence ao usuario
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


/* atualiza os dados da doação */
exports.editarDoacao = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario_id = req.usuario.id;

    // pega imagem atual para nao perder caso nao envie outra
    const [[atual]] = await db.query(
      'SELECT imagem FROM doacoes WHERE id=? AND usuario_id=?',
      [id, usuario_id]
    );

    // impede editar doação de outro usuario
    if (!atual) {
      return res.status(403).json({ erro: 'sem permissão' });
    }

    // se enviou nova imagem usa ela, senao mantém antiga
    const imagem = req.file ? req.file.filename : atual.imagem;

    // atualiza dados
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


/* exclui uma doação do proprio usuario */
exports.excluirDoacao = async (req, res) => {
  // primeiro remove solicitações ligadas a ela
  await db.query(
    'DELETE FROM solicitacoes_coleta WHERE doacao_id=?',
    [req.params.id]
  );

  // depois remove a doação
  await db.query(
    'DELETE FROM doacoes WHERE id=? AND usuario_id=?',
    [req.params.id, req.usuario.id]
  );

  res.json({ sucesso: true });
};


/* lista todas doações para o painel admin */
exports.listarTodasAdmin = async (req, res) => {
  try {
    // mostra tudo independente de status com nome do usuario
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.nome_material,
        d.tipo_material,
        d.quantidade,
        d.descricao,
        d.dias_semana,
        d.horarios,
        d.imagem,
        d.status,
        b.nome AS bairro,
        u.nome AS usuario_nome
      FROM doacoes d
      JOIN usuarios u ON u.id = d.usuario_id
      LEFT JOIN bairros b ON b.id = d.bairro_id
      ORDER BY d.id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error('erro admin doacoes:', err);
    res.status(500).json({ erro: 'erro ao listar doações' });
  }
};


/* admin remove qualquer doação */
exports.removerAdmin = async (req, res) => {
  // remove primeiro as coletas vinculadas
  await db.query(
    'DELETE FROM solicitacoes_coleta WHERE doacao_id=?',
    [req.params.id]
  );

  // remove a doação sem verificar dono
  await db.query(
    'DELETE FROM doacoes WHERE id=?',
    [req.params.id]
  );

  res.json({ sucesso: true });
};


/* usado quando alguem abre a tela de solicitar coleta */
exports.buscarPorId = async (req, res) => {
  try {

    // pega infos básicas da doação e nome do doador
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.nome_material,
        d.quantidade,
        d.descricao,
        d.imagem,
        u.nome AS doador
      FROM doacoes d
      LEFT JOIN usuarios u ON u.id = d.usuario_id
      WHERE d.id = ?
    `, [req.params.id]);

    if (!rows.length)
      return res.status(404).json({ erro: 'Doação não encontrada' });

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar doação' });
  }
};