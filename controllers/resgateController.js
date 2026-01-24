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

    // 1️⃣ Buscar loja
    const [[loja]] = await db.query(
      'SELECT * FROM lojas WHERE id = ?',
      [loja_id]
    );

    if (!loja) {
      return res.status(404).json({ erro: 'Loja não encontrada' });
    }

    // 2️⃣ Buscar usuário
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (usuario.pontos < loja.pontos) {
      return res.status(400).json({
        erro: 'Pontos insuficientes para resgatar este cupom'
      });
    }

    // 3️⃣ Gerar código do cupom
    const codigo = gerarCodigoCupom(loja.nome);

    // 4️⃣ Debitar pontos
    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [loja.pontos, usuarioId]
    );

    // 5️⃣ Registrar resgate com código
    await db.query(
      `INSERT INTO resgates (usuario_id, loja_id, pontos_usados, codigo)
       VALUES (?, ?, ?, ?)`,
      [usuarioId, loja.id, loja.pontos, codigo]
    );

    res.json({
      sucesso: true,
      codigo,
      pontos_restantes: usuario.pontos - loja.pontos
    });

  } catch (err) {
    console.error('Erro ao resgatar cupom:', err);
    res.status(500).json({ erro: 'Erro ao resgatar cupom' });
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
