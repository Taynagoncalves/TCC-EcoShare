const db = require('../models/db');


function gerarCodigoCupom(nomeLoja) {
  const letra = nomeLoja.charAt(0).toUpperCase();
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';

  for (let i = 0; i < 5; i++) {
    random += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }

  return letra + random;
}
exports.resgatarCupom = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { loja_id } = req.body;

    if (!loja_id) {
      return res.status(400).json({ erro: 'Loja inválida' });
    }

    /* BUSCA USUÁRIO */
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    /* BUSCA LOJA */
    const [[loja]] = await db.query(
      'SELECT * FROM lojas WHERE id = ?',
      [loja_id]
    );

    if (!loja) {
      return res.status(404).json({ erro: 'Loja não encontrada' });
    }

    /* VERIFICA PONTOS */
    if (usuario.pontos < loja.pontos_necessarios) {
      return res.status(400).json({
        erro: 'Pontos insuficientes para resgatar este cupom'
      });
    }

    /* 🔒 VERIFICA SE JÁ RESGATOU */
    const [[jaResgatou]] = await db.query(
      'SELECT id FROM cupons_resgatados WHERE usuario_id = ? AND loja_id = ?',
      [usuarioId, loja_id]
    );

    if (jaResgatou) {
      return res.status(400).json({
        erro: 'Você já resgatou este cupom'
      });
    }

    /* GERA CÓDIGO ÚNICO */
    const prefixo = loja.nome.charAt(0).toUpperCase();
    const codigo = `${prefixo}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    /* SALVA CUPOM */
    await db.query(
      `INSERT INTO cupons_resgatados 
       (usuario_id, loja_id, codigo)
       VALUES (?, ?, ?)`,
      [usuarioId, loja_id, codigo]
    );

    /* DEBITA PONTOS */
    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [loja.pontos_necessarios, usuarioId]
    );

    return res.json({
      sucesso: true,
      codigo
    });

  } catch (erro) {
    console.error('ERRO AO RESGATAR CUPOM:', erro);
    return res.status(500).json({
      erro: 'Erro interno ao resgatar cupom'
    });
  }
};
exports.usarCupom = async (req, res) => {
  try {
    const { codigo } = req.body;

    // 1️⃣ Buscar cupom
    const [[cupom]] = await db.query(
      'SELECT * FROM resgates WHERE codigo = ?',
      [codigo]
    );

    if (!cupom) {
      return res.status(404).json({ erro: 'Cupom não encontrado' });
    }

    // 2️⃣ Verificar se já foi usado
    if (cupom.usado) {
      return res.status(400).json({
        erro: 'Este cupom já foi utilizado'
      });
    }

    // 3️⃣ Marcar como usado
    await db.query(
      `UPDATE resgates
       SET usado = TRUE, usado_em = NOW()
       WHERE id = ?`,
      [cupom.id]
    );

    res.json({ sucesso: true });

  } catch (err) {
    console.error('Erro ao usar cupom:', err);
    res.status(500).json({ erro: 'Erro ao validar cupom' });
  }
};
