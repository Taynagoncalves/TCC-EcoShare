const db = require('../models/db');
const { criarNotificacao } = require('./notificacaoController');

/* solicitar coleta */
exports.solicitarColeta = async (req, res) => {
  try {
    const solicitante_id = req.usuario.id;
    const { doacao_id } = req.body;

    if (!doacao_id) {
      return res.status(400).json({ erro: 'doação inválida' });
    }

    const [[doacao]] = await db.query(
      'select usuario_id from doacoes where id = ?',
      [doacao_id]
    );

    if (!doacao) {
      return res.status(404).json({ erro: 'doação não encontrada' });
    }

    if (doacao.usuario_id === solicitante_id) {
      return res.status(400).json({
        erro: 'você não pode solicitar sua própria doação'
      });
    }

    await db.query(
      `
      insert into solicitacoes_coleta
      (doacao_id, solicitante_id, doador_id)
      values (?, ?, ?)
      `,
      [doacao_id, solicitante_id, doacao.usuario_id]
    );

    await criarNotificacao(
      doacao.usuario_id,
      'solicitacao',
      'você recebeu uma nova solicitação de coleta.'
    );

    res.json({ sucesso: true });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        erro: 'você já solicitou a coleta desta doação'
      });
    }

    console.error('erro solicitar coleta:', err);
    res.status(500).json({
      erro: 'erro interno ao solicitar coleta'
    });
  }
};

/* listar solicitações recebidas (doador) */
exports.listarSolicitacoes = async (req, res) => {
  try {
    const doador_id = req.usuario.id;

    const [rows] = await db.query(`
      select
        sc.id as solicitacao_id,
        sc.doacao_id,
        sc.status,
        d.nome_material,
        d.quantidade,
        d.imagem,
        u.nome as solicitante
      from solicitacoes_coleta sc
      join doacoes d on d.id = sc.doacao_id
      join usuarios u on u.id = sc.solicitante_id
      where sc.doador_id = ?
        and sc.status = 'pendente'
    `, [doador_id]);

    res.json(rows);

  } catch (err) {
    console.error('erro listar solicitacoes:', err);
    res.status(500).json({ erro: 'erro ao listar solicitações' });
  }
};

/* confirmar coleta */
exports.confirmarColeta = async (req, res) => {
  try {
    const solicitacaoId = Number(req.params.id);
    const usuarioId = req.usuario.id;

    if (!solicitacaoId) {
      return res.status(400).json({ erro: 'id inválido' });
    }

    const [[solicitacao]] = await db.query(`
      select solicitante_id, doador_id
      from solicitacoes_coleta
      where id = ?
    `, [solicitacaoId]);

    if (!solicitacao) {
      return res.status(404).json({ erro: 'solicitação não encontrada' });
    }

    if (solicitacao.doador_id !== usuarioId) {
      return res.status(403).json({
        erro: 'apenas o doador pode confirmar a coleta'
      });
    }

    await db.query(
      `
      update solicitacoes_coleta
      set status = 'confirmada'
      where id = ?
      `,
      [solicitacaoId]
    );

    await criarNotificacao(
      solicitacao.solicitante_id,
      'andamento',
      'sua solicitação foi aceita. a coleta está em andamento.'
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('erro ao confirmar coleta:', err);
    res.status(500).json({ erro: 'erro ao confirmar coleta' });
  }
};

/* recusar coleta */
exports.recusarColeta = async (req, res) => {
  try {
    const solicitacaoId = Number(req.params.id);
    const usuarioId = req.usuario.id;

    const [[solicitacao]] = await db.query(`
      select solicitante_id, doador_id
      from solicitacoes_coleta
      where id = ?
    `, [solicitacaoId]);

    if (!solicitacao) {
      return res.status(404).json({ erro: 'solicitação não encontrada' });
    }

    if (solicitacao.doador_id !== usuarioId) {
      return res.status(403).json({
        erro: 'apenas o doador pode recusar a coleta'
      });
    }

    await db.query(
      `
      update solicitacoes_coleta
      set status = 'recusada'
      where id = ?
      `,
      [solicitacaoId]
    );

    await criarNotificacao(
      solicitacao.solicitante_id,
      'recusada',
      'sua solicitação de coleta foi recusada.'
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('erro ao recusar coleta:', err);
    res.status(500).json({ erro: 'erro ao recusar coleta' });
  }
};

/* coletas em andamento */
exports.coletasEmAndamento = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await db.query(`
      select
        sc.id as solicitacao_id,
        sc.status,
        d.nome_material,
        d.quantidade,
        d.imagem,
        u1.nome as solicitante_nome,
        u1.telefone as solicitante_telefone,
        u2.nome as doador_nome,
        u2.telefone as doador_telefone,
        case
          when sc.doador_id = ? then 'doador'
          else 'solicitante'
        end as papel
      from solicitacoes_coleta sc
      join doacoes d on d.id = sc.doacao_id
      join usuarios u1 on u1.id = sc.solicitante_id
      join usuarios u2 on u2.id = sc.doador_id
      where sc.status = 'confirmada'
        and (sc.doador_id = ? or sc.solicitante_id = ?)
    `, [usuarioId, usuarioId, usuarioId]);

    res.json(rows);

  } catch (err) {
    console.error('erro coletas andamento:', err);
    res.status(500).json({ erro: 'erro ao buscar coletas em andamento' });
  }
};

/* concluir coleta */
exports.concluirColeta = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const [[solicitacao]] = await db.query(`
      select doador_id, doacao_id
      from solicitacoes_coleta
      where id = ?
    `, [id]);

    if (!solicitacao) {
      return res.status(404).json({ erro: 'solicitação não encontrada' });
    }

    if (solicitacao.doador_id !== usuarioId) {
      return res.status(403).json({
        erro: 'apenas o doador pode concluir a coleta'
      });
    }

    const pontos = 20;

    await db.query(
      `
      update solicitacoes_coleta
      set status = 'concluida'
      where id = ?
      `,
      [id]
    );

    await db.query(
      `
      update usuarios
      set pontos = coalesce(pontos, 0) + ?
      where id = ?
      `,
      [pontos, solicitacao.doador_id]
    );

    await db.query(
      `
      update doacoes
      set status = 'concluido'
      where id = ?
      `,
      [solicitacao.doacao_id]
    );

    res.json({
      sucesso: true,
      pontos
    });

  } catch (err) {
    console.error('erro ao concluir coleta:', err);
    res.status(500).json({ erro: 'erro ao concluir coleta' });
  }
};

/* cancelar coleta */
exports.cancelarColeta = async (req, res) => {
  try {
    const solicitacaoId = Number(req.params.id);
    const usuarioId = req.usuario.id;

    const [[solicitacao]] = await db.query(`
      select solicitante_id, status
      from solicitacoes_coleta
      where id = ?
    `, [solicitacaoId]);

    if (!solicitacao) {
      return res.status(404).json({ erro: 'solicitação não encontrada' });
    }

    if (solicitacao.solicitante_id !== usuarioId) {
      return res.status(403).json({
        erro: 'apenas o solicitante pode cancelar'
      });
    }

    if (solicitacao.status !== 'pendente') {
      return res.status(400).json({
        erro: 'só é possível cancelar solicitações pendentes'
      });
    }

    await db.query(
      `
      update solicitacoes_coleta
      set status = 'cancelada'
      where id = ?
      `,
      [solicitacaoId]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('erro ao cancelar coleta:', err);
    res.status(500).json({ erro: 'erro ao cancelar coleta' });
  }
};

/* historico de coletas */
exports.historico = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await db.query(`
      select
        sc.id,
        sc.status,
        d.nome_material,
        d.quantidade,
        d.imagem,
        sc.doador_id,
        sc.solicitante_id
      from solicitacoes_coleta sc
      join doacoes d on d.id = sc.doacao_id
      where sc.status = 'concluida'
        and (sc.doador_id = ? or sc.solicitante_id = ?)
      order by sc.id desc
    `, [usuarioId, usuarioId]);

    res.json(rows);

  } catch (err) {
    console.error('erro historico coleta:', err);
    res.status(500).json({ erro: 'erro ao buscar histórico' });
  }
};
exports.listarColetasAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        sc.id,
        d.nome_material,
        d.quantidade,
        u1.nome AS doador_nome,
        u2.nome AS solicitante_nome,
        sc.status
      FROM solicitacoes_coleta sc
      JOIN doacoes d ON d.id = sc.doacao_id
      JOIN usuarios u1 ON u1.id = sc.doador_id
      JOIN usuarios u2 ON u2.id = sc.solicitante_id
      ORDER BY sc.id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error('Erro ao listar coletas admin:', err);
    res.status(500).json({ erro: 'Erro ao listar coletas' });
  }
};


