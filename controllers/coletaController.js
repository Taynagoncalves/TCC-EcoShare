const db = require('../models/db');

/* =========================
   SOLICITAR COLETA
========================= */
exports.solicitarColeta = async (req, res) => {
  try {
    const solicitante_id = req.usuario.id;
    const { doacao_id } = req.body;

    const [[doacao]] = await db.query(
      'SELECT usuario_id FROM doacoes WHERE id = ?',
      [doacao_id]
    );

    if (!doacao) {
      return res.status(404).json({ erro: 'Doação não encontrada' });
    }

    if (doacao.usuario_id === solicitante_id) {
      return res.status(400).json({
        erro: 'Você não pode solicitar sua própria doação'
      });
    }

    await db.query(
      `INSERT INTO solicitacoes_coleta
       (doacao_id, solicitante_id, doador_id)
       VALUES (?, ?, ?)`,
      [doacao_id, solicitante_id, doacao.usuario_id]
    );

    res.json({ sucesso: true });

  } catch (err) {
    // 🔥 TRATAMENTO DO UNIQUE
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        erro: 'Você já solicitou a coleta desta doação.'
      });
    }

    console.error(err);
    res.status(500).json({
      erro: 'Erro interno ao solicitar coleta'
    });
  }
};



exports.listarSolicitacoes = async (req, res) => {
  try {
    const doador_id = req.usuario.id;

   const [rows] = await db.query(`
  SELECT 
    sc.id AS solicitacao_id,
    sc.doacao_id,
    sc.status,
    d.nome_material,
    d.quantidade,
    d.imagem,
    u.nome AS solicitante
  FROM solicitacoes_coleta sc
  JOIN doacoes d ON d.id = sc.doacao_id
  JOIN usuarios u ON u.id = sc.solicitante_id
  WHERE sc.doador_id = ?
    AND sc.status = 'pendente'
`, [doador_id]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar solicitações' });
  }
};


/* =========================
   CONFIRMAR
========================= */
exports.confirmarColeta = async (req, res) => {
  try {
    const solicitacaoId = Number(req.params.id);

    if (!solicitacaoId) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    await db.query(
      `UPDATE solicitacoes_coleta 
       SET status = 'confirmada'
       WHERE id = ?`,
      [solicitacaoId]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('ERRO AO CONFIRMAR:', err);
    res.status(500).json({ erro: 'Erro ao confirmar coleta' });
  }
};


exports.recusarColeta = async (req, res) => {
  try {
    const solicitacaoId = Number(req.params.id);

    if (!solicitacaoId) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    await db.query(
      `UPDATE solicitacoes_coleta 
       SET status = 'recusada'
       WHERE id = ?`,
      [solicitacaoId]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('ERRO AO RECUSAR:', err);
    res.status(500).json({ erro: 'Erro ao recusar coleta' });
  }
};

exports.coletasEmAndamento = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await db.query(`
      SELECT
        sc.id AS solicitacao_id,
        sc.status,
        d.nome_material,
        d.quantidade,
        d.imagem,
        u1.nome AS solicitante_nome,
        u1.telefone AS solicitante_telefone,
        u2.nome AS doador_nome,
        u2.telefone AS doador_telefone,
        CASE
          WHEN sc.doador_id = ? THEN 'doador'
          ELSE 'solicitante'
        END AS papel
      FROM solicitacoes_coleta sc
      JOIN doacoes d ON d.id = sc.doacao_id
      JOIN usuarios u1 ON u1.id = sc.solicitante_id
      JOIN usuarios u2 ON u2.id = sc.doador_id
      WHERE sc.status = 'confirmada'
        AND (sc.doador_id = ? OR sc.solicitante_id = ?)
    `, [usuarioId, usuarioId, usuarioId]);

    res.json(rows);
  } catch (err) {
    console.error('ERRO COLETAS ANDAMENTO:', err);
    res.status(500).json({ erro: 'Erro ao buscar coletas em andamento' });
  }
};
