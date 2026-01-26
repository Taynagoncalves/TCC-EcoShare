const db = require('../models/db');

/* =========================
   BUSCAR PONTOS
========================= */
exports.buscarPontos = async (req, res) => {
  try {
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    res.json({ pontos: usuario.pontos || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pontos' });
  }
};

/* =========================
   DEBITAR PONTOS
========================= */
exports.debitarPontos = async (req, res) => {
  try {
    const { pontos } = req.body;

    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [pontos, req.usuario.id]
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao debitar pontos' });
  }
};

/* =========================
   DADOS DO USUÁRIO
========================= */
exports.me = async (req, res) => {
  try {
    const [[usuario]] = await db.query(
      `
      SELECT id, nome, email, telefone, tipo, pontos
      FROM usuarios
      WHERE id = ?
      `,
      [req.usuario.id]
    );

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
};

/* =========================
   RESGATAR CUPOM (🔥 ESSENCIAL)
========================= */
exports.resgatarCupom = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { loja_id } = req.body;

    if (!loja_id) {
      return res.status(400).json({ erro: 'Loja inválida' });
    }

    // 🔹 Usuário
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // 🔹 Loja (coluna correta: pontos)
    const [[loja]] = await db.query(
      'SELECT id, nome, pontos FROM lojas WHERE id = ?',
      [loja_id]
    );

    if (!loja) {
      return res.status(404).json({ erro: 'Loja não encontrada' });
    }

    const pontosUsuario = Number(usuario.pontos);
    const custo = Number(loja.pontos); // ✅ CERTO

    if (isNaN(custo) || custo <= 0) {
      return res.status(400).json({ erro: 'Cupom com valor inválido' });
    }

    if (pontosUsuario < custo) {
      return res.status(400).json({
        erro: 'Pontos insuficientes'
      });
    }

    // 🔒 Verifica se já resgatou (tabela correta)
    const [[jaResgatou]] = await db.query(
      'SELECT id FROM resgates WHERE usuario_id = ? AND loja_id = ?',
      [usuarioId, loja_id]
    );

    if (jaResgatou) {
      return res.status(400).json({
        erro: 'Cupom já resgatado'
      });
    }

    // ✅ PRIMEIRO: debita pontos (se falhar, nada acontece)
    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [custo, usuarioId]
    );

    // 🔹 Gera código
    const codigo =
      loja.nome.charAt(0).toUpperCase() +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    // ✅ DEPOIS: registra resgate
    await db.query(
      `
      INSERT INTO resgates (usuario_id, loja_id, pontos_usados, codigo, usado)
      VALUES (?, ?, ?, ?, 0)
      `,
      [usuarioId, loja_id, custo, codigo]
    );

    res.json({
      sucesso: true,
      codigo,
      pontos_restantes: pontosUsuario - custo
    });

  } catch (err) {
    console.error('ERRO RESGATE:', err);
    res.status(500).json({ erro: 'Erro interno ao resgatar cupom' });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.query(`
      SELECT id, nome, email, tipo, pontos, status
      FROM usuarios
    `);

    res.json(usuarios);
  } catch (err) {
    console.error('ERRO LISTAR USUÁRIOS:', err);
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

/* =========================
   ADMIN — BLOQUEAR / DESBLOQUEAR
========================= */
exports.alterarStatusUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      'UPDATE usuarios SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao alterar status' });
  }
};

/* =========================
   ADMIN — ALTERAR TIPO
========================= */
exports.alterarTipoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;

    await db.query(
      'UPDATE usuarios SET tipo = ? WHERE id = ?',
      [tipo, id]
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao alterar tipo' });
  }
};