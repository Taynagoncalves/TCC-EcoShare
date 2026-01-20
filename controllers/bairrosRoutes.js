const express = require('express');
const router = express.Router();
const bairrosController = require('./bairrosController');

router.get('/bairros', bairrosController.listarBairros);

module.exports = router;
