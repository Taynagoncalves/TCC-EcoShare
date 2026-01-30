const db = require('../models/db');
const fs = require('fs');
const path = require('path');

/* criar doação */
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
      `insert into doacoes
      (nome_material, quantidade, tipo_material, descricao, bairro_id,
       dias_semana, horarios, imagem, status, usuario_id)
      values (?, ?, ?, ?, ?, ?, ?, ?, 'ativo', ?)`,
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
    console.error('erro ao criar doação:', error);
    res.status(500).json({ erro: 'erro ao criar doação' });
  }
};

/* listar doações (home) */
exports.listarDoacoes = async (req, res) => {
  const [rows] = await db.query(`
    select 
      d.id,
      d.nome_material,
      d.quantidade,
      d.tipo_material,
      d.imagem,
      b.nome as bairro
    from doacoes d
    left join bairros b on d.bairro_id = b.id
    where d.status = 'ativo'
  `);

  res.json(rows);
};

/* detalhes da doação */
exports.detalhesDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      select 
        d.id,
        d.nome_material,
        d.quantidade,
        d.tipo_material,
        d.descricao,
        d.dias_semana,
        d.horarios,
        d.imagem,
        d.status,
        b.nome as bairro,
        u.nome as usuario
      from doacoes d
      left join bairros b on d.bairro_id = b.id
      left join usuarios u on d.usuario_id = u.id
      where d.id = ?
      limit 1
    `, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ erro: 'doação não encontrada' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('erro ao buscar detalhes da doação:', error);
    res.status(500).json({ erro: 'erro ao buscar detalhes' });
  }
};

/* minhas doações */
exports.minhasDoacoes = async (req, res) => {
  const usuario_id = req.usuario.id;

  const [rows] = await db.query(`
    select 
      id,
      nome_material,
      quantidade,
      status,
      imagem
    from doacoes
    where usuario_id = ?
  `, [usuario_id]);

  res.json(rows);
};

/* excluir doação (usuário) */
exports.excluirDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const [rows] = await db.query(
      'select imagem from doacoes where id = ? and usuario_id = ?',
      [id, usuario_id]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        erro: 'você não tem permissão para excluir esta doação'
      });
    }

    const imagem = rows[0].imagem;

    await db.query(
      'delete from doacoes where id = ? and usuario_id = ?',
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
    console.error('erro ao excluir doação:', error);
    res.status(500).json({ erro: 'erro ao excluir doação' });
  }
};

/* admin listar todas as doações */
exports.listarTodasAdmin = async (req, res) => {
  try {
    const [doacoes] = await db.query(`
      select 
        d.id,
        d.nome_material,
        d.quantidade,
        d.status,
        u.nome as usuario_nome
      from doacoes d
      join usuarios u on u.id = d.usuario_id
      order by d.id desc
    `);

    res.json(doacoes);
  } catch (err) {
    console.error('erro admin ao listar doações:', err);
    res.status(500).json({ erro: 'erro ao listar doações' });
  }
};

/* admin remover doação */
exports.removerAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [[doacao]] = await db.query(
      'select imagem from doacoes where id = ?',
      [id]
    );

    if (!doacao) {
      return res.status(404).json({ erro: 'doação não encontrada' });
    }

    await db.query(
      'delete from solicitacoes_coleta where doacao_id = ?',
      [id]
    );

    await db.query(
      'delete from doacoes where id = ?',
      [id]
    );

    if (doacao.imagem) {
      const caminhoImagem = path.join(__dirname, '..', 'uploads', doacao.imagem);
      if (fs.existsSync(caminhoImagem)) {
        fs.unlinkSync(caminhoImagem);
      }
    }

    res.json({ sucesso: true });

  } catch (err) {
    console.error('erro ao remover doação admin:', err);
    res.status(500).json({ erro: 'erro ao remover doação' });
  }
};
