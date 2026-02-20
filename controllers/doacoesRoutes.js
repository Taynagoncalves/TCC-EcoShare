const express = require('express');
const router = express.Router();

const upload = require('../models/upload');
const doacoesController = require('./doacoesController');
const verificarAutenticacao = require('./verificarAutenticacao');
const verificarAdmin = require('./verificarAdmin');

/* rotas usadas pelo admin */

// mostra todas as doações do sistema inteiro, só entra quem estiver logado e for admin
router.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.listarTodasAdmin
);

// apaga qualquer doação, não precisa ser dono, mas precisa ser admin
router.delete(
  '/admin/:id',
  verificarAutenticacao,
  verificarAdmin,
  doacoesController.removerAdmin
);


/* rotas normais do usuario */

// cria uma nova doação e permite enviar uma imagem
router.post(
  '/',
  verificarAutenticacao,
  upload.single('imagem'),
  doacoesController.criarDoacao
);

// lista as doações públicas que aparecem na home
router.get(
  '/',
  doacoesController.listarDoacoes
);

// lista apenas as doações do usuario logado
router.get(
  '/minhas-doacoes',
  verificarAutenticacao,
  doacoesController.minhasDoacoes
);

// busca dados de uma doação para preencher o formulario de edição
router.get(
  '/:id/editar',
  verificarAutenticacao,
  doacoesController.buscarParaEdicao
);

// salva as alterações da edição e permite trocar a imagem
router.put(
  '/:id',
  verificarAutenticacao,
  upload.single('imagem'),
  doacoesController.editarDoacao
);

// mostra os detalhes completos de uma doação
// fica por ultimo porque qualquer coisa /:id pode bater aqui
router.get(
  '/:id',
  doacoesController.detalhesDoacao
);

// exclui uma doação do proprio usuario
router.delete(
  '/:id',
  verificarAutenticacao,
  doacoesController.excluirDoacao
);

// busca info resumida da doação para solicitar coleta
// exige login
router.get('/:id', verificarAutenticacao, doacoesController.buscarPorId);

module.exports = router;