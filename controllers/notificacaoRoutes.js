const express = require('express');
const router = express.Router();
const db = require('../models/db');
const verificarAutenticacao = require('./verificarAutenticacao');

// 🔔 listar TODAS as notificações (lidas e não lidas)
router.get('/', verificarAutenticacao, async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY criada_em DESC',
    [req.usuario.id]
  );
  res.json(rows);
});

// ✅ marcar UMA notificação como lida
router.put('/:id/lida', verificarAutenticacao, async (req, res) => {
  await db.query(
    'UPDATE notificacoes SET lida = true WHERE id = ? AND usuario_id = ?',
    [req.params.id, req.usuario.id]
  );
  res.json({ ok: true });
});

// 🧹 LIMPAR TODAS AS NOTIFICAÇÕES (APAGAR DEFINITIVAMENTE)
router.delete('/limpar', verificarAutenticacao, async (req, res) => {
  await db.query(
    'DELETE FROM notificacoes WHERE usuario_id = ?',
    [req.usuario.id]
  );
  res.json({ ok: true });
});

module.exports = router;
