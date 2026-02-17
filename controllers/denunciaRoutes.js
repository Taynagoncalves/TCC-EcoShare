const express = require('express');
const router = express.Router();
const denunciaController = require('./denunciaController');
const verificarAutenticacao = require('./verificarAutenticacao');
const verificarAdmin = require('./verificarAdmin');

// usuário envia denúncia
router.post('/', verificarAutenticacao, denunciaController.enviarDenuncia);

// admin lista denúncias
router.get('/admin', verificarAutenticacao, verificarAdmin, denunciaController.listarAdmin);

// admin resolve denúncia
router.put('/:id/resolver', verificarAutenticacao, verificarAdmin, denunciaController.resolverDenuncia);

module.exports = router;
