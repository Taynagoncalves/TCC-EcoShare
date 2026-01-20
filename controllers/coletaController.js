const db = require('../models/db');

/* =========================
   SOLICITAR COLETA
========================= */
exports.solicitarColeta = async (req, res) => {
  const solicitante_id = req.usuario.id;
  const { doacao_id } = req.body;

  const [[doacao]] = await db.query(
    'SELECT usuario_id FROM doacoes WHERE id = ?',
    [doacao_id]
  );

  // 🔴 AQUI É O PONTO-CHAVE
  const doador_id = doacao.usuario_id;

  await db.query(
    `INSERT INTO solicitacoes_coleta
     (doacao_id, solicitante_id, doador_id)
     VALUES (?, ?, ?)`,
    [doacao_id, solicitante_id, doador_id]
  );

  res.json({ sucesso: true });
};



exports.listarSolicitacoes = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    const doador_id = req.usuario.id;

    const [rows] = await db.query(`
      SELECT 
        sc.id,
        sc.status,
        d.nome_material,
        d.quantidade,
        d.imagem,
        u.nome AS solicitante,
        u.email,
        u.telefone
      FROM solicitacoes_coleta sc
      JOIN doacoes d ON sc.doacao_id = d.id
      JOIN usuarios u ON sc.solicitante_id = u.id
      WHERE sc.doador_id = ?
        AND sc.status = 'pendente'
    `, [doador_id]);

    res.json(rows);

  } catch (error) {
    console.error('ERRO listarSolicitacoes:', error);
    res.status(500).json({ erro: 'Erro ao listar solicitações' });
  }
};

/* =========================
   CONFIRMAR
========================= */
exports.confirmarColeta = async (req, res) => {
  await db.query(
    'UPDATE solicitacoes_coleta SET status = "confirmada" WHERE id = ?',
    [req.params.id]
  );

  res.json({ sucesso: true });
};

/* =========================
   RECUSAR
========================= */
exports.recusarColeta = async (req, res) => {
  await db.query(
    'UPDATE solicitacoes_coleta SET status = "recusada" WHERE id = ?',
    [req.params.id]
  );

  res.json({ sucesso: true });
};
