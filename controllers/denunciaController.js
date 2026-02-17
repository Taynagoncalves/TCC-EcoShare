const db = require('../models/db');

/* =========================
   USUÁRIO — ENVIAR DENÚNCIA
========================= */
exports.enviarDenuncia = async (req, res) => {
  const { mensagem, doacao_id } = req.body;
  const usuarioId = req.usuario.id;

  if (!mensagem) {
    return res.status(400).json({ erro: 'Mensagem obrigatória' });
  }

  try {

    await db.query(`
      INSERT INTO denuncias (usuario_id, doacao_id, mensagem, status)
      VALUES (?, ?, ?, 'pendente')
    `, [usuarioId, doacao_id || null, mensagem]);

    res.json({ sucesso: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao registrar denúncia' });
  }
};


/* =========================
   ADMIN — LISTAR DENÚNCIAS
========================= */
exports.listarAdmin = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        d.id AS denuncia_id,
        d.mensagem,
        d.status,
        d.criada_em,
        d.doacao_id,

        u.nome AS denunciante,

        doacao.nome_material,
        doacao.quantidade,
        doacao.descricao,
        doacao.imagem,

        dono.nome AS doador

      FROM denuncias d
      LEFT JOIN usuarios u ON u.id = d.usuario_id
      LEFT JOIN doacoes doacao ON doacao.id = d.doacao_id
      LEFT JOIN usuarios dono ON dono.id = doacao.usuario_id

      ORDER BY d.id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar denúncias' });
  }
};


/* =========================
   ADMIN — RESOLVER DENÚNCIA
========================= */
exports.resolverDenuncia = async (req, res) => {
  const id = req.params.id;

  try {

    await db.query(`
      UPDATE denuncias
      SET status = 'resolvido'
      WHERE id = ?
    `, [id]);

    res.json({ sucesso: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao resolver denúncia' });
  }
};
