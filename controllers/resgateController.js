const db = require('../models/db');

/* resgata um cupom usando pontos do usuário */
exports.resgatarCupom = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const loja_id = Number(req.body.loja_id);

    // verifica se o id da loja é válido
    if (!loja_id || isNaN(loja_id)) {
      return res.status(400).json({
        ok: false,
        erro: 'loja inválida'
      });
    }

    // pega os pontos atuais do usuario
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        erro: 'usuário não encontrado'
      });
    }

    // pega dados da loja e quanto custa o cupom
    const [[loja]] = await db.query(
      'SELECT nome, pontos FROM lojas WHERE id = ?',
      [loja_id]
    );

    if (!loja || loja.pontos == null) {
      return res.status(400).json({
        ok: false,
        erro: 'cupom inválido ou sem pontos definidos'
      });
    }

    const pontosUsuario = Number(usuario.pontos);
    const custo = Number(loja.pontos);

    // impede custo errado
    if (isNaN(custo) || custo <= 0) {
      return res.status(400).json({
        ok: false,
        erro: 'valor do cupom inválido'
      });
    }

    // verifica se tem pontos suficientes
    if (pontosUsuario < custo) {
      return res.status(400).json({
        ok: false,
        erro: 'pontos insuficientes'
      });
    }

    // impede resgatar duas vezes o mesmo cupom
    const [[existe]] = await db.query(
      'SELECT id FROM resgates WHERE usuario_id = ? AND loja_id = ?',
      [usuarioId, loja_id]
    );

    if (existe) {
      return res.status(400).json({
        ok: false,
        erro: 'cupom já resgatado'
      });
    }

    // gera codigo tipo 3 primeira letra do nome da loja 
    const prefixo = loja.nome
      .trim()
      .substring(0, 3)
      .toUpperCase();

    const sufixo = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    const codigo = `${prefixo}-${sufixo}`;

    // desconta os pontos do usuario
    await db.query(
      `
      UPDATE usuarios
      SET pontos = pontos - ?
      WHERE id = ?
      `,
      [custo, usuarioId]
    );

    // registra que ele ganhou esse cupom
    await db.query(
      `
      INSERT INTO resgates 
        (usuario_id, loja_id, pontos_usados, codigo, usado)
      VALUES (?, ?, ?, ?, 0)
      `,
      [usuarioId, loja_id, custo, codigo]
    );

    // retorna sucesso e pontos restantes
    return res.json({
      ok: true,
      codigo,
      pontos_restantes: pontosUsuario - custo
    });

  } catch (err) {
    console.error('Erro ao resgatar cupom:', err);
    return res.status(500).json({
      ok: false,
      erro: 'erro interno ao resgatar cupom'
    });
  }
};


/* lista todos cupons já resgatados pelo usuario */
exports.meusCupons = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // junta resgates com dados da loja
    const [rows] = await db.query(`
      SELECT
        r.id,
        r.loja_id,
        r.codigo,
        r.pontos_usados,
        r.usado,
        l.nome AS loja_nome,
        l.imagem AS loja_imagem,
        l.endereco AS loja_endereco
      FROM resgates r
      JOIN lojas l ON l.id = r.loja_id
      WHERE r.usuario_id = ?
      ORDER BY r.id DESC
    `, [usuarioId]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar cupons' });
  }
};