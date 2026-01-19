const express = require('express');
const router = express.Router();

const upload = require('../models/upload');
const doacoesController = require('./doacoesController');
const verificarAutenticacao = require('./verificarAutenticacao');

/* CRIAR DOAÇÃO */
router.post(
  '/doacoes',
  verificarAutenticacao,
  upload.single('imagem'),
  doacoesController.criarDoacao
);

/* HOME */
router.get(
  '/doacoes',
  doacoesController.listarDoacoes
);

/* MINHAS PUBLICAÇÕES */
router.get(
  '/minhas-doacoes',
  verificarAutenticacao,
  doacoesController.minhasDoacoes
);

module.exports = router;
