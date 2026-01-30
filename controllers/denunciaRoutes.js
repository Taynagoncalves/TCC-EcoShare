const express = require('express');
const router = express.Router();
const denunciaController = require('./denunciaController');
const verificarAutenticacao = require('./verificarAutenticacao');

// enviar denúncia
router.post(
  '/',
  verificarAutenticacao,
  denunciaController.enviarDenuncia
);

module.exports = router;
