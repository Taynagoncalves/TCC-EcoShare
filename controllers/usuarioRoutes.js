const express = require('express');
const router = express.Router();
const db = require('../models/db');

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
   DEBITAR PONTOS (USADO EM RESGATE)
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

module.exports = router;
