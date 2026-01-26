const express = require('express');
const router = express.Router();
const db = require('../models/db');

const verificarAdmin = require('./verificarAdmin');
const verificarAutenticacao = require('./verificarAutenticacao');
const usuarioController = require('./usuarioController');

/* =========================
   USUÁRIO LOGADO (DADOS BÁSICOS)
========================= */
router.get(
  '/usuario-logado',
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
          pontos
        FROM usuarios
        WHERE id = ?
        `,
        [req.usuario.id]
      );

      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      res.json(usuario);
    } catch (err) {
      console.error('ERRO USUÁRIO LOGADO:', err);
      res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
  }
);

/* =========================
   PONTOS DO USUÁRIO
========================= */
router.get(
  '/usuarios/pontos',
  verificarAutenticacao,
  usuarioController.buscarPontos
);

/* =========================
   DEBITAR PONTOS
========================= */
router.post(
  '/usuarios/debitar-pontos',
  verificarAutenticacao,
  usuarioController.debitarPontos
);

/* =========================
   DADOS DO USUÁRIO (ME)
========================= */
router.get(
  '/usuario/me',
  verificarAutenticacao,
  usuarioController.me
);

/* =========================
   RESGATAR CUPOM
========================= */
router.post(
  '/resgatar',
  verificarAutenticacao,
  usuarioController.resgatarCupom
);

/* =========================
   ADMIN — LISTAR USUÁRIOS (API)
========================= */
router.get(
  '/api/admin/usuarios',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.listarUsuarios
);

/* =========================
   ADMIN — BLOQUEAR / DESBLOQUEAR
========================= */
router.put(
  '/admin/usuarios/:id/status',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.alterarStatusUsuario
);

/* =========================
   ADMIN — ALTERAR TIPO (ADMIN / USUÁRIO)
========================= */
router.put(
  '/admin/usuarios/:id/tipo',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.alterarTipoUsuario
);

module.exports = router;
