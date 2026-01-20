const express = require('express');
const router = express.Router();
const denunciaController = require('../controllers/denunciaController');

router.post('/denuncia', denunciaController.enviarDenuncia);

module.exports = router;
