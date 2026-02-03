const express = require('express');
const router = express.Router();

const verificarAutenticacao = require('./verificarAutenticacao');
const verificarAdmin = require('./verificarAdmin');
const coletaController = require('./coletaController');

// solicitar coleta
router.post(
  '/solicitar',
  verificarAutenticacao,
  coletaController.solicitarColeta
);

// solicitações recebidas
router.get(
  '/recebidas',
  verificarAutenticacao,
  coletaController.listarSolicitacoes
);

// confirmar coleta
router.put(
  '/:id/confirmar',
  verificarAutenticacao,
  coletaController.confirmarColeta
);

// recusar coleta
router.put(
  '/:id/recusar',
  verificarAutenticacao,
  coletaController.recusarColeta
);

// coletas em andamento
router.get(
  '/andamento',
  verificarAutenticacao,
  coletaController.coletasEmAndamento
);

// concluir coleta
router.put(
  '/concluir/:id',
  verificarAutenticacao,
  coletaController.concluirColeta
);

// cancelar coleta
router.put(
  '/cancelar/:id',
  verificarAutenticacao,
  coletaController.cancelarColeta
);

// histórico
router.get(
  '/historico',
  verificarAutenticacao,
  coletaController.historico
);

// 🔐 ADMIN — LISTAR TODAS AS COLETAS
router.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  coletaController.listarColetasAdmin
);

module.exports = router;
