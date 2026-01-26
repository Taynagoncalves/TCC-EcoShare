const db = require('../models/db');

/* =========================
   RESGATAR CUPOM
========================= */
exports.resgatarCupom = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const loja_id = Number(req.body.loja_id);

    /* 🔒 VALIDA ID DA LOJA */
    if (!loja_id || isNaN(loja_id)) {
      return res.status(400).json({ erro: 'Loja inválida' });
    }

    /* 🔹 BUSCA USUÁRIO */
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    /* 🔹 BUSCA LOJA */
    const [[loja]] = await db.query(
      'SELECT pontos FROM lojas WHERE id = ?',
      [loja_id]
    );

    if (!loja || loja.pontos == null) {
      return res.status(400).json({
        erro: 'Cupom inválido ou sem pontos definidos'
      });
    }

    const pontosUsuario = Number(usuario.pontos);
    const custo = Number(loja.pontos);

    /* 🔒 BLOQUEIA CUSTO INVÁLIDO */
    if (isNaN(custo) || custo <= 0) {
      return res.status(400).json({
        erro: 'Valor do cupom inválido'
      });
    }

    /* ❌ BLOQUEIA SALDO INSUFICIENTE */
    if (pontosUsuario < custo) {
      return res.status(400).json({
        erro: 'Pontos insuficientes para resgatar este cupom'
      });
    }

    /* 🔒 VERIFICA SE JÁ RESGATOU (ANTES DE TUDO) */
    const [[existe]] = await db.query(
      'SELECT id FROM resgates WHERE usuario_id = ? AND loja_id = ?',
      [usuarioId, loja_id]
    );

    if (existe) {
      return res.status(400).json({
        erro: 'Você já resgatou este cupom'
      });
    }

    /* ✅ PRIMEIRO: DESCONTA OS PONTOS (SE ISSO FALHAR, PARA TUDO) */
    await db.query(
      `
      UPDATE usuarios
      SET pontos = pontos - ?
      WHERE id = ?
      `,
      [custo, usuarioId]
    );

    /* 🔹 DEPOIS: REGISTRA O RESGATE */
    const codigo = `CUPOM-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    await db.query(
      `
      INSERT INTO resgates (usuario_id, loja_id, pontos_usados, codigo, usado)
      VALUES (?, ?, ?, ?, 0)
      `,
      [usuarioId, loja_id, custo, codigo]
    );

    return res.json({
      sucesso: true,
      codigo,
      pontos_restantes: pontosUsuario - custo
    });

  } catch (err) {
    console.error('ERRO RESGATE:', err);
    return res.status(500).json({
      erro: 'Erro interno ao resgatar cupom'
    });
  }
};
