const db = require('../models/db');

exports.listarBairros = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome FROM bairros ORDER BY nome'
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar bairros' });
  }
};
