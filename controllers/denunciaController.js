const db = require('../models/db');

/* USUÁRIO — ENVIAR DENÚNCIA*/
exports.enviarDenuncia = async (req, res) => {
  const { mensagem, doacao_id, categoria } = req.body;
  const usuarioId = req.usuario.id;

  if (!mensagem || !doacao_id || !categoria)
    return res.status(400).json({ erro: 'Dados incompletos' });

  try {

    // verificar dono da publicação
    const [[doacao]] = await db.query(
      'SELECT usuario_id FROM doacoes WHERE id=?',
      [doacao_id]
    );

    if (!doacao)
      return res.status(404).json({ erro:'Doação não encontrada' });

    if (doacao.usuario_id === usuarioId)
      return res.status(403).json({ erro:'Você não pode denunciar sua própria publicação' });

    // inserir denúncia
    await db.query(`
      INSERT INTO denuncias (usuario_id, doacao_id, mensagem, categoria, status)
      VALUES (?, ?, ?, ?, 'pendente')
    `,[usuarioId, doacao_id, mensagem, categoria]);

    res.json({ sucesso:true });

  } catch (err) {

    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ erro:'Você já denunciou esta publicação' });

    console.error(err);
    res.status(500).json({ erro:'Erro ao registrar denúncia' });
  }
};


/* ADMIN — LISTAR DENÚNCIAS*/
exports.listarAdmin = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        d.id AS denuncia_id,
        d.mensagem,
        d.categoria,
        d.status,
        d.criada_em,
        d.doacao_id,

        u.id AS denunciante_id,
        u.nome AS denunciante,

        doacao.id AS doacao_real_id,
        doacao.nome_material,
        doacao.quantidade,
        doacao.descricao,
        doacao.imagem,

        dono.id AS doador_id,
        dono.nome AS doador

      FROM denuncias d
      LEFT JOIN usuarios u ON u.id = d.usuario_id
      LEFT JOIN doacoes doacao ON doacao.id = d.doacao_id
      LEFT JOIN usuarios dono ON dono.id = doacao.usuario_id

      ORDER BY 
    CASE 
    WHEN d.status = 'pendente' THEN 0
    WHEN d.status = 'analisando' THEN 1
    ELSE 2
    END,
    d.id DESC

    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar denúncias' });
  }
};


/* ADMIN — RESOLVER DENÚNCIA */
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
