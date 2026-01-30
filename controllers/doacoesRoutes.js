const express = require('express');
const router = express.Router();

const upload = require('../models/upload');
const doacoesController = require('./doacoesController');
const verificarAutenticacao = require('./verificarAutenticacao');
const verificarAdmin = require('./verificarAdmin');

/* =========================
   USUÁRIO
========================= */

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

/* =========================
   ADMIN (⚠️ ANTES DO :id)
========================= */

router.get(
  '/doacoes/admin',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.listarTodasAdmin
);

router.delete(
  '/doacoes/admin/:id',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.removerAdmin
);

/* =========================
   ROTAS COM :id (POR ÚLTIMO)
========================= */

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

module.exports = router;
