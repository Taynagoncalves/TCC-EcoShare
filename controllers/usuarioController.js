const db = require('../models/db');


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


exports.me = async (req, res) => {
  try {
    const [[usuario]] = await db.query(
      `
      SELECT id, nome, email, telefone, tipo, pontos, data_nascimento, foto
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

  
    const [[jaResgatou]] = await db.query(
      'SELECT id FROM resgates WHERE usuario_id = ? AND loja_id = ?',
      [usuarioId, loja_id]
    );

    if (jaResgatou) {
      return res.status(400).json({
        erro: 'Cupom já resgatado'
      });
    }

    
    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [custo, usuarioId]
    );


    const codigo =
      loja.nome.charAt(0).toUpperCase() +
      Math.random().toString(36).substring(2, 8).toUpperCase();

  
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

/* =========================
   EDITAR PERFIL (nome, email, telefone, data_nascimento)
========================= */
exports.atualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nome, email, telefone, data_nascimento } = req.body;

    // validações básicas (sem travar seu TCC)
    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
    }

    // normaliza
    const nomeFinal = String(nome).trim();
    const emailFinal = String(email).trim().toLowerCase();
    const telefoneFinal = telefone ? String(telefone).trim() : null;
    const dataFinal = data_nascimento ? String(data_nascimento).trim() : null; // YYYY-MM-DD

    await db.query(
      `
      UPDATE usuarios
      SET nome = ?, email = ?, telefone = ?, data_nascimento = ?
      WHERE id = ?
      `,
      [nomeFinal, emailFinal, telefoneFinal, dataFinal, usuarioId]
    );

    // devolve atualizado
    const [[usuario]] = await db.query(
      `
      SELECT id, nome, email, telefone, data_nascimento, tipo, pontos, foto
      FROM usuarios
      WHERE id = ?
      `,
      [usuarioId]
    );

    res.json({ sucesso: true, usuario });
  } catch (err) {
    console.error('ERRO atualizarPerfil:', err);
    res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
};

/* =========================
   ATUALIZAR FOTO (multer)
========================= */
exports.atualizarFoto = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    if (!req.file) {
      return res.status(400).json({ erro: 'Envie uma imagem.' });
    }

    // caminho público (ajuste caso seu express static seja diferente)
    const fotoPath = `/uploads/avatars/${req.file.filename}`;

    await db.query(
      'UPDATE usuarios SET foto = ? WHERE id = ?',
      [fotoPath, usuarioId]
    );

    res.json({ sucesso: true, foto: fotoPath });
  } catch (err) {
    console.error('ERRO atualizarFoto:', err);
    res.status(500).json({ erro: 'Erro ao atualizar foto' });
  }
};