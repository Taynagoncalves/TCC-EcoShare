const express = require('express');
const router = express.Router();
const verificarAdmin = require('./verificarAdmin');
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
router.get('/doacoes', doacoesController.listarDoacoes);

/* DETALHES */
router.get('/doacoes/:id', doacoesController.detalhesDoacao);

/* MINHAS PUBLICAÇÕES */
router.get(
  '/minhas-doacoes',
  verificarAutenticacao,
  doacoesController.minhasDoacoes
);
/* EXCLUIR DOAÇÃO */
router.delete(
  '/doacoes/:id',
  verificarAutenticacao,
  doacoesController.excluirDoacao
);
// listar todas
router.get(
  '/api/admin/doacoes',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.listarTodasAdmin
);

// remover (soft delete)
router.delete(
  '/api/admin/doacoes/:id',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.removerDoacaoAdmin
);
module.exports = router;
