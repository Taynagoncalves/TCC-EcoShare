const express = require('express');
const router = express.Router();
const db = require('../models/db');

const verificarAdmin = require('./verificarAdmin');
const verificarAutenticacao = require('./verificarAutenticacao');
const usuarioController = require('./usuarioController');

const path = require('path');
const fs = require('fs');
const multer = require('multer');


// configura pasta onde ficam as fotos de perfil
const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });


// define como a foto será salva
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),

  // nomeia o arquivo com id do usuario + data pra não repetir nome
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `user_${req.usuario.id}_${Date.now()}${safeExt}`);
  }
});


// aceita apenas imagens
const fileFilter = (req, file, cb) => {
  const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Formato inválido (use PNG/JPG/WEBP)'), ok);
};


// limita tamanho para 3mb
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }
});


// retorna dados do usuario logado
router.get('/me', verificarAutenticacao, async (req, res) => {

  try {

    // resposta fake pro admin fixo
    if (req.usuario && req.usuario.tipo === 'admin' && req.usuario.id === 0) {
      return res.json({
        id: 0,
        nome: 'Administrador',
        email: 'admin@ecoshare.com',
        telefone: '',
        data_nascimento: null,
        tipo: 'admin',
        pontos: 0,
        foto: null
      });
    }

    // usuario normal
    const [[usuario]] = await db.query(`
      SELECT id,nome,email,telefone,data_nascimento,tipo,pontos,foto
      FROM usuarios
      WHERE id = ?
    `,[req.usuario.id]);

    if (!usuario) {
      return res.status(404).json({ erro: 'usuário não encontrado' });
    }

    res.json(usuario);

  } catch (err) {
    console.error('erro usuário logado:', err);
    res.status(500).json({ erro: 'erro ao buscar usuário' });
  }
});


// retorna se notificações estão ligadas
router.get(
  '/me/notificacoes',
  verificarAutenticacao,
  async (req, res) => {
    try {
      const [[row]] = await db.query(
        'SELECT notificacoes_ativas FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      if (!row) {
        return res.status(404).json({ erro: 'usuário não encontrado' });
      }

      res.json({ notificacoes_ativas: !!row.notificacoes_ativas });
    } catch (err) {
      console.error('erro ao buscar preferência de notificações:', err);
      res.status(500).json({ erro: 'erro ao buscar preferência de notificações' });
    }
  }
);


// liga ou desliga notificações
router.put(
  '/me/notificacoes',
  verificarAutenticacao,
  async (req, res) => {
    try {
      const { ativas } = req.body || {};

      if (typeof ativas !== 'boolean') {
        return res.status(400).json({ erro: 'campo "ativas" deve ser boolean' });
      }

      await db.query(
        'UPDATE usuarios SET notificacoes_ativas = ? WHERE id = ?',
        [ativas, req.usuario.id]
      );

      res.json({ ok: true, notificacoes_ativas: ativas });
    } catch (err) {
      console.error('erro ao atualizar preferência de notificações:', err);
      res.status(500).json({ erro: 'erro ao atualizar preferência de notificações' });
    }
  }
);


// altera nome email telefone e data nascimento
router.put(
  '/me',
  verificarAutenticacao,
  usuarioController.atualizarPerfil
);


// troca foto de perfil
router.put(
  '/me/foto',
  verificarAutenticacao,
  upload.single('foto'),
  usuarioController.atualizarFoto
);


// retorna pontos do usuario
router.get(
  '/pontos',
  verificarAutenticacao,
  usuarioController.buscarPontos
);


// remove pontos manualmente
router.post(
  '/debitar-pontos',
  verificarAutenticacao,
  usuarioController.debitarPontos
);


// resgata cupom usando pontos
router.post(
  '/resgatar',
  verificarAutenticacao,
  usuarioController.resgatarCupom
);


// admin lista todos usuarios
router.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.listarUsuarios
);


// admin altera status ativo bloqueado etc
router.put(
  '/admin/:id/status',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.alterarStatusUsuario
);


// admin muda tipo comum admin etc
router.put(
  '/admin/:id/tipo',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.alterarTipoUsuario
);


// admin vê dados completos de um usuario
router.get(
  '/admin/:id',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.buscarUsuarioPorId
);


// admin pune usuario (suspende ou bane)
router.put(
  '/admin/punir/:id',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.punirUsuario
);


// admin exclui usuario permanentemente
router.delete(
  '/admin/:id',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.excluirUsuario
);

module.exports = router;