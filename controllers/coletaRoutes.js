const express = require('express');
const router = express.Router();
const verificarAutenticacao = require('./verificarAutenticacao');
const coletaController = require('./coletaController');

router.post(
  '/coletas/solicitar',
  verificarAutenticacao,
  coletaController.solicitarColeta
);

router.get(
  '/coletas/recebidas',
  verificarAutenticacao,
  coletaController.listarSolicitacoes
);

router.put(
  '/coletas/:id/confirmar',
  verificarAutenticacao,
  coletaController.confirmarColeta
);

router.put(
  '/coletas/:id/recusar',
  verificarAutenticacao,
  coletaController.recusarColeta
);

router.get(
  '/coletas/andamento',
  verificarAutenticacao,
  coletaController.coletasEmAndamento
);
router.put(
  '/coletas/concluir/:id',
  verificarAutenticacao,
  coletaController.concluirColeta
);
router.put(
  '/coletas/cancelar/:id',
  verificarAutenticacao,
  coletaController.cancelarColeta
);
router.get(
  '/api/historico',
  verificarAutenticacao,
  coletaController.historico
);
router.put(
  '/coletas/concluir/:id',
  verificarAutenticacao,
  coletaController.concluirColeta
);;
router.post(
  '/coletas/solicitar',
  verificarAutenticacao,
  coletaController.solicitarColeta
);

module.exports = router;
