const db = require('../models/db');
const nodemailer = require('nodemailer');


/* retorna quantos pontos o usuario tem */
exports.buscarPontos = async (req, res) => {
  try {

    // admin fixo não usa sistema de pontos
    if (req.usuario && req.usuario.tipo === 'admin' && req.usuario.id === 0) {
      return res.json({ pontos: 0 });
    }

    // busca pontos no banco
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    res.json({ pontos: usuario?.pontos || 0 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pontos' });
  }
};


/* remove pontos do usuario */
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


/* retorna dados do usuario logado */
exports.me = async (req, res) => {
  try {

    // dados fake do admin fixo
    if (req.usuario && req.usuario.tipo === "admin" && req.usuario.id === 0) {
      return res.json({
        id: 0,
        nome: "Administrador",
        email: "admin@ecoshare.com",
        telefone: "",
        tipo: "admin",
        pontos: 1000,
        data_nascimento: null,
        foto: null
      });
    }

    // usuario normal
    const [[usuario]] = await db.query(`
      SELECT id, nome, email, telefone, tipo, pontos, data_nascimento, foto
      FROM usuarios
      WHERE id = ?
    `,[req.usuario.id]);

    res.json(usuario);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
};


/* outra versão de resgate de cupom direto pelo usuario */
exports.resgatarCupom = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { loja_id } = req.body;

    if (!loja_id) {
      return res.status(400).json({ erro: 'Loja inválida' });
    }

    // pega pontos do usuario
    const [[usuario]] = await db.query(
      'SELECT pontos FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // pega valor do cupom
    const [[loja]] = await db.query(
      'SELECT id, nome, pontos FROM lojas WHERE id = ?',
      [loja_id]
    );

    if (!loja) {
      return res.status(404).json({ erro: 'Loja não encontrada' });
    }

    const pontosUsuario = Number(usuario.pontos);
    const custo = Number(loja.pontos);

    if (isNaN(custo) || custo <= 0) {
      return res.status(400).json({ erro: 'Cupom com valor inválido' });
    }

    if (pontosUsuario < custo) {
      return res.status(400).json({
        erro: 'Pontos insuficientes'
      });
    }

    // impede pegar duas vezes
    const [[jaResgatou]] = await db.query(
      'SELECT id FROM resgates WHERE usuario_id = ? AND loja_id = ?',
      [usuarioId, loja_id]
    );

    if (jaResgatou) {
      return res.status(400).json({
        erro: 'Cupom já resgatado'
      });
    }

    // desconta pontos
    await db.query(
      'UPDATE usuarios SET pontos = pontos - ? WHERE id = ?',
      [custo, usuarioId]
    );

    // gera codigo simples
    const codigo =
      loja.nome.charAt(0).toUpperCase() +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    // salva resgate
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


/* lista todos usuarios para o painel admin */
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


/* busca um usuario específico pelo id */
exports.buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
SELECT 
  u.id,
  u.nome,
  u.email,
  u.telefone,
  u.data_nascimento,
  u.tipo,
  u.status,
  u.pontos,
  u.endereco,
  u.numero,
  u.cep,
  u.complemento,
  u.bairro
FROM usuarios u
WHERE u.id = ?
`, [id]);

    if (!rows.length) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
};


/* muda status do usuario tipo ativo bloqueado etc */
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


/* muda tipo do usuario comum admin etc */
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


/* atualiza nome email telefone e data nascimento do perfil */
exports.atualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nome, email, telefone, data_nascimento } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
    }

    // limpa formatação
    const nomeFinal = String(nome).trim();
    const emailFinal = String(email).trim().toLowerCase();
    const telefoneFinal = telefone ? String(telefone).trim() : null;
    const dataFinal = data_nascimento ? String(data_nascimento).trim() : null;

    // atualiza no banco
    await db.query(
      `
      UPDATE usuarios
      SET nome = ?, email = ?, telefone = ?, data_nascimento = ?
      WHERE id = ?
      `,
      [nomeFinal, emailFinal, telefoneFinal, dataFinal, usuarioId]
    );

    // retorna dados atualizados
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


/* atualiza foto de perfil */
exports.atualizarFoto = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    if (!req.file) {
      return res.status(400).json({ erro: 'Envie uma imagem.' });
    }

    // salva caminho da imagem
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


/* aplica punição no usuario e manda email avisando */
exports.punirUsuario = async (req, res) => {

  const { tipo, motivo } = req.body;
  const userId = req.params.id;

  if (!motivo) return res.status(400).json({ erro:'Motivo obrigatório' });

  try {

    let bloqueadoAte = null;

    // suspensão de 7 dias
    if (tipo === '7dias')
      bloqueadoAte = new Date(Date.now() + 7*24*60*60*1000);

    // ban permanente
    if (tipo === 'ban')
      bloqueadoAte = '9999-12-31 23:59:59';

    // aplica punição no banco
    await db.query(`
      UPDATE usuarios
      SET status='bloqueado',
          bloqueado_ate=?,
          motivo_bloqueio=?
      WHERE id=?
    `,[bloqueadoAte, motivo, userId]);

    // pega email do usuario
    const [[usuario]] = await db.query(
      'SELECT nome,email FROM usuarios WHERE id=?',[userId]
    );

    // envia aviso por email
    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
      }
    });

    const texto =
      tipo === 'ban'
      ? `Sua conta foi banida permanentemente.\nMotivo: ${motivo}`
      : `Sua conta foi suspensa por 7 dias.\nMotivo: ${motivo}`;

    await transporter.sendMail({
      from:`EcoShare <${process.env.EMAIL_USER}>`,
      to:usuario.email,
      subject:'Ação administrativa em sua conta',
      text:`Olá ${usuario.nome},\n\n${texto}\n\nEquipe EcoShare`
    });

    res.json({ sucesso:true });

  } catch(err){
    console.error(err);
    res.status(500).json({ erro:'erro ao punir usuário' });
  }
};


/* remove o usuario definitivamente do sistema */
exports.excluirUsuario = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { id } = req.params;

    // começa transação para não quebrar integridade do banco
    await conn.beginTransaction();

    // remove tudo relacionado ao usuario
    await conn.query("DELETE FROM denuncias WHERE usuario_id = ?", [id]);
    await conn.query("DELETE FROM notificacoes WHERE usuario_id = ?", [id]);
    await conn.query("DELETE FROM resgates WHERE usuario_id = ?", [id]);
    await conn.query("DELETE FROM solicitacoes_coleta WHERE solicitante_id = ? OR doador_id = ?", [id, id]);
    await conn.query("DELETE FROM doacoes WHERE usuario_id = ?", [id]);

    // por último apaga o usuario
    await conn.query("DELETE FROM usuarios WHERE id = ?", [id]);

    await conn.commit();

    res.json({ ok: true, message: "Usuário removido permanentemente" });

  } catch (err) {
    // se algo falhar volta tudo
    await conn.rollback();
    console.error("ERRO excluirUsuario:", err);
    res.status(500).json({ error: "Erro ao excluir usuário" });
  } finally {
    conn.release();
  }
};