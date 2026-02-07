const express = require('express');
const router = express.Router();
const db = require('../models/db');

const verificarAdmin = require('./verificarAdmin');
const verificarAutenticacao = require('./verificarAutenticacao');
const usuarioController = require('./usuarioController');

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// =========================
// MULTER (UPLOAD FOTO)
// =========================
const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `user_${req.usuario.id}_${Date.now()}${safeExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Formato inválido (use PNG/JPG/WEBP)'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

// =========================
// DADOS DO USUÁRIO LOGADO
// =========================
router.get(
  '/me',
  verificarAutenticacao,
  async (req, res) => {
    try {
      const [[usuario]] = await db.query(
        `
        SELECT 
          id,
          nome,
          email,
          telefone,
          data_nascimento,
          tipo,
          pontos,
          foto
        FROM usuarios
        WHERE id = ?
        `,
        [req.usuario.id]
      );

      if (!usuario) {
        return res.status(404).json({ erro: 'usuário não encontrado' });
      }

      res.json(usuario);
    } catch (err) {
      console.error('erro usuário logado:', err);
      res.status(500).json({ erro: 'erro ao buscar usuário' });
    }
  }
);

// =========================
// EDITAR DADOS DO PERFIL
// =========================
router.put(
  '/me',
  verificarAutenticacao,
  usuarioController.atualizarPerfil
);

// =========================
// ATUALIZAR FOTO DO PERFIL
// =========================
router.put(
  '/me/foto',
  verificarAutenticacao,
  upload.single('foto'),
  usuarioController.atualizarFoto
);

// pontos do usuário
router.get(
  '/pontos',
  verificarAutenticacao,
  usuarioController.buscarPontos
);

// debitar pontos
router.post(
  '/debitar-pontos',
  verificarAutenticacao,
  usuarioController.debitarPontos
);

// resgatar cupom
router.post(
  '/resgatar',
  verificarAutenticacao,
  usuarioController.resgatarCupom
);

// admin listar usuários
router.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.listarUsuarios
);

// admin bloquear / desbloquear
router.put(
  '/admin/:id/status',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.alterarStatusUsuario
);

// admin alterar tipo
router.put(
  '/admin/:id/tipo',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.alterarTipoUsuario
);

module.exports = router;