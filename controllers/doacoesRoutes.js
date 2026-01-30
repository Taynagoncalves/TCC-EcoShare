const express = require('express');
const router = express.Router();

const upload = require('../models/upload');
const doacoesController = require('./doacoesController');
const verificarAutenticacao = require('./verificarAutenticacao');
const verificarAdmin = require('./verificarAdmin');

/* rotas de usuário */
router.post(
  '/doacoes',
  verificarAutenticacao,
  upload.single('imagem'),
  doacoesController.criarDoacao
);

router.get(
  '/doacoes',
  doacoesController.listarDoacoes
);

router.get(
  '/doacoes/:id',
  doacoesController.detalhesDoacao
);

router.delete(
  '/doacoes/:id',
  verificarAutenticacao,
  doacoesController.excluirDoacao
);

router.get(
  '/minhas-doacoes',
  verificarAutenticacao,
  doacoesController.minhasDoacoes
);

/* rotas de admin */
router.get(
  '/admin/doacoes',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.listarTodasAdmin
);

router.delete(
  '/admin/doacoes/:id',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.removerAdmin
);

module.exports = router;
