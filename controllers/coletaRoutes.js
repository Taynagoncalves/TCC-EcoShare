const express = require('express');
const router = express.Router();
const verificarAutenticacao = require('./verificarAutenticacao');
const coletaController = require('./coletaController');

router.get(
  '/coletas/recebidas',
  verificarAutenticacao,
  coletaController.listarSolicitacoes
);

module.exports = router;
