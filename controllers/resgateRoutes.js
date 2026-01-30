const express = require('express');
const router = express.Router();

const verificarAutenticacao = require('./verificarAutenticacao');
const resgateController = require('./resgateController');

// resgatar cupom
router.post(
  '/resgatar',
  verificarAutenticacao,
  resgateController.resgatarCupom
);

// listar meus cupons resgatados
router.get(
  '/meus',
  verificarAutenticacao,
  resgateController.meusCupons
);

module.exports = router;
