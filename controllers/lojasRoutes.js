const express = require('express');
const router = express.Router();

const verificarAutenticacao = require('./verificarAutenticacao');
const verificarAdmin = require('./verificarAdmin');
const lojasController = require('./lojasController');
const upload = require('../models/upload');

// LISTAR LOJAS
router.get(
  '/api/admin/lojas',
  verificarAutenticacao,
  verificarAdmin,
  lojasController.listarLojas
);

// CRIAR LOJA (COM IMAGEM)
router.post(
  '/api/admin/lojas',
  verificarAutenticacao,
  verificarAdmin,
  upload.single('imagem'),
  lojasController.criarLoja
);
// LOJAS DISPONÍVEIS PARA RESGATE (USUÁRIO)
router.get(
  '/api/lojas',
  verificarAutenticacao,
  lojasController.listarLojas
);

// EXCLUIR LOJA
router.delete(
  '/api/admin/lojas/:id',
  verificarAutenticacao,
  verificarAdmin,
  lojasController.excluirLoja
);

module.exports = router;
