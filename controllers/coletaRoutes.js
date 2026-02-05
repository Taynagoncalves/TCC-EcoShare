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

// solicitações recebidas (doador)
router.get(
  '/recebidas',
  verificarAutenticacao,
  coletaController.listarSolicitacoes
);

// confirmar coleta (doador)
router.put(
  '/:id/confirmar',
  verificarAutenticacao,
  coletaController.confirmarColeta
);

// recusar coleta (doador)
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

// concluir coleta (doador → ganha pontos)
router.put(
  '/concluir/:id',
  verificarAutenticacao,
  coletaController.concluirColeta
);

// ❌ cancelar solicitação pendente (SOLICITANTE)
router.put(
  '/cancelar/:id',
  verificarAutenticacao,
  coletaController.cancelarColeta
);

// cancelar coleta em andamento (DOADOR — sem pontos)
router.put(
  '/cancelar-andamento/:id',
  verificarAutenticacao,
  coletaController.cancelarColetaEmAndamento
);

// histórico
router.get(
  '/historico',
  verificarAutenticacao,
  coletaController.historico
);

// admin
router.get(
  '/admin',
  verificarAutenticacao,
  verificarAdmin,
  coletaController.listarColetasAdmin
);

module.exports = router;
