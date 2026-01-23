const express = require('express');
const router = express.Router();

const usuarioController = require('./usuarioController');
const verificarAutenticacao = require('./verificarAutenticacao');

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

module.exports = router;
