const express = require('express');
const router = express.Router();
const db = require('../models/db');

// listar bairros
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome FROM bairros ORDER BY nome'
    );
    res.json(rows);
  } catch (err) {
    console.error('erro ao listar bairros:', err);
    res.status(500).json({ erro: 'erro ao carregar bairros' });
  }
});

module.exports = router;
