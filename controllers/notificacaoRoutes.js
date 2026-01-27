const express = require('express');
const router = express.Router();
const db = require('../models/db');
const verificarAutenticacao = require('./verificarAutenticacao');

router.get('/notificacoes', verificarAutenticacao, async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY criada_em DESC',
    [req.usuario.id]
  );
  res.json(rows);
});

router.put('/notificacoes/:id/lida', verificarAutenticacao, async (req, res) => {
  await db.query(
    'UPDATE notificacoes SET lida = true WHERE id = ? AND usuario_id = ?',
    [req.params.id, req.usuario.id]
  );
  res.json({ ok: true });
});

module.exports = router;
