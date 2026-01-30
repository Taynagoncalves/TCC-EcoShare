const express = require('express');
const router = express.Router();
const db = require('../models/db');

const verificarAdmin = require('./verificarAdmin');
const verificarAutenticacao = require('./verificarAutenticacao');
const usuarioController = require('./usuarioController');

// dados do usuário logado
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
          pontos
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
