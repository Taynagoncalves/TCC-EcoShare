const express = require('express');
const router = express.Router();
const db = require('../models/db');
const verificarAutenticacao = require('./verificarAutenticacao');
const usuarioController = require('./usuarioController');

/* =========================
   USUÁRIO LOGADO (DADOS COMPLETOS)
========================= */
router.get(
  '/usuario-logado',
  verificarAutenticacao,
  async (req, res) => {
    try {
      const [[usuario]] = await db.query(`
        SELECT 
          id,
          nome,
          email,
          telefone,
          data_nascimento
        FROM usuarios
        WHERE id = ?
      `, [req.usuario.id]);

      res.json(usuario);
    } catch (err) {
      console.error('ERRO USUÁRIO LOGADO:', err);
      res.status(500).json({ erro: 'Erro ao buscar usuário' });
    }
  }
);

/* =========================
   PONTOS
========================= */
router.get(
  '/usuarios/pontos',
  verificarAutenticacao,
  usuarioController.buscarPontos
);

router.post(
  '/usuarios/debitar-pontos',
  verificarAutenticacao,
  usuarioController.debitarPontos
);
router.get(
  '/usuario/me',
  verificarAutenticacao,
  usuarioController.me
);

module.exports = router;
