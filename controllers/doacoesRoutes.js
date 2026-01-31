const express = require('express');
const router = express.Router();

const upload = require('../models/upload');
const doacoesController = require('./doacoesController');
const verificarAutenticacao = require('./verificarAutenticacao');
const verificarAdmin = require('./verificarAdmin');

/* =========================
   ROTAS DO USUÁRIO
========================= */

// criar doação
router.post(
  '/',
  verificarAutenticacao,
  upload.single('imagem'),
  doacoesController.criarDoacao
);

// listar doações (home)
router.get(
  '/',
  doacoesController.listarDoacoes
);

// minhas doações
router.get(
  '/minhas-doacoes',
  verificarAutenticacao,
  doacoesController.minhasDoacoes
);

// buscar para edição (antes do :id)
router.get(
  '/:id/editar',
  verificarAutenticacao,
  doacoesController.buscarParaEdicao
);

// editar doação
router.put(
  '/:id',
  verificarAutenticacao,
  upload.single('imagem'),
  doacoesController.editarDoacao
);

// detalhes
router.get(
  '/:id',
  doacoesController.detalhesDoacao
);

// excluir
router.delete(
  '/:id',
  verificarAutenticacao,
  doacoesController.excluirDoacao
);

/* =========================
   ROTAS ADMIN
========================= */

router.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.listarTodasAdmin
);

router.delete(
  '/admin/:id',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.removerAdmin
);

module.exports = router;
