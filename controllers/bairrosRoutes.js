const express = require('express');
const router = express.Router();
const controller = require('./bairrosController');

router.get('/bairros', controller.listarBairros);

module.exports = router;
