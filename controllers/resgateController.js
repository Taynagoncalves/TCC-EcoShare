const db = require('../models/db');

/* resgatar cupom */
exports.resgatarCupom = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const loja_id = Number(req.body.loja_id);

    /* valida id da loja */
    if (!loja_id || isNaN(loja_id)) {
      return res.status(400).json({ erro: 'loja inválida' });
    }

    /* busca usuário */
    const [[usuario]] = await db.query(
      'select pontos from usuarios where id = ?',
      [usuarioId]
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'usuário não encontrado' });
    }

    /* busca loja */
    const [[loja]] = await db.query(
      'select pontos from lojas where id = ?',
      [loja_id]
    );

    if (!loja || loja.pontos == null) {
      return res.status(400).json({
        erro: 'cupom inválido ou sem pontos definidos'
      });
    }

    const pontosUsuario = Number(usuario.pontos);
    const custo = Number(loja.pontos);

    /* bloqueia custo inválido */
    if (isNaN(custo) || custo <= 0) {
      return res.status(400).json({
        erro: 'valor do cupom inválido'
      });
    }

    /* bloqueia saldo insuficiente */
    if (pontosUsuario < custo) {
      return res.status(400).json({
        erro: 'pontos insuficientes para resgatar este cupom'
      });
    }

    /* verifica se já resgatou */
    const [[existe]] = await db.query(
      'select id from resgates where usuario_id = ? and loja_id = ?',
      [usuarioId, loja_id]
    );

    if (existe) {
      return res.status(400).json({
        erro: 'você já resgatou este cupom'
      });
    }

    /* desconta os pontos do usuário */
    await db.query(
      `
      update usuarios
      set pontos = pontos - ?
      where id = ?
      `,
      [custo, usuarioId]
    );

    /* registra o resgate */
    const codigo = `CUPOM-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    await db.query(
      `
      insert into resgates (usuario_id, loja_id, pontos_usados, codigo, usado)
      values (?, ?, ?, ?, 0)
      `,
      [usuarioId, loja_id, custo, codigo]
    );

    return res.json({
      sucesso: true,
      codigo,
      pontos_restantes: pontosUsuario - custo
    });

  } catch (err) {
    console.error('erro ao resgatar cupom:', err);
    return res.status(500).json({
      erro: 'erro interno ao resgatar cupom'
    });
  }
};

/* meus cupons */
exports.meusCupons = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await db.query(`
      select 
        r.codigo,
        r.pontos_usados,
        l.nome as loja_nome
      from resgates r
      join lojas l on l.id = r.loja_id
      where r.usuario_id = ?
      order by r.id desc
    `, [usuarioId]);

    res.json(rows);

  } catch (err) {
    console.error('erro ao buscar cupons:', err);
    res.status(500).json({ erro: 'erro ao buscar cupons' });
  }
};
