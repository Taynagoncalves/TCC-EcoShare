const express = require('express');
const router = express.Router();
const verificarAutenticacao = require('../controllers/verificarAutenticacao');
const resgateController = require('../controllers/resgateController');

router.post(
  '/resgatar',
  verificarAutenticacao,
  resgateController.resgatarCupom
);

module.exports = router;
