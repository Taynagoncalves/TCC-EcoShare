const express = require('express');
const router = express.Router();

const verificarAutenticacao = require('./verificarAutenticacao');
const verificarAdmin = require('./verificarAdmin');
const lojasController = require('./lojasController');
const upload = require('../models/upload');

// listar lojas (usuario)
router.get(
  '/',
  verificarAutenticacao,
  lojasController.listarLojas
);

// listar lojas (admin)
router.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  lojasController.listarLojas
);

// criar loja (admin)
router.post(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  upload.single('imagem'),
  lojasController.criarLoja
);

// excluir loja (admin)
router.delete(
  '/admin/:id',
  verificarAutenticacao,
  verificarAdmin,
  lojasController.excluirLoja
);

module.exports = router;
