// controllers/planController.js
const db = require('../config/db');

exports.createPlan = (req, res) => {
  const { nome_plano, tipo_plano, preco, status } = req.body;
  const sql = `INSERT INTO planos (nome_plano, tipo_plano, preco, status)
               VALUES (?, ?, ?, ?)`;
  const params = [nome_plano, tipo_plano, preco, status];
  db.run(sql, params, function(err) {
    if (err) res.status(400).json({ error: err.message });
    else res.json({ id: this.lastID });
  });
};

exports.getPlans = (req, res) => {
  const sql = "SELECT * FROM planos";
  db.all(sql, [], (err, rows) => {
    if (err) res.status(400).json({ error: err.message });
    else res.json(rows);
  });
};

exports.getPlanById = (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM planos WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) res.status(400).json({ error: err.message });
    else res.json(row);
  });
};

exports.updatePlan = (req, res) => {
  const id = req.params.id;
  const { nome_plano, tipo_plano, preco, status } = req.body;
  const sql = `UPDATE planos SET 
                nome_plano = COALESCE(?, nome_plano),
                tipo_plano = COALESCE(?, tipo_plano),
                preco = COALESCE(?, preco),
                status = COALESCE(?, status)
              WHERE id = ?`;
  const params = [nome_plano, tipo_plano, preco, status, id];
  db.run(sql, params, function(err) {
    if (err) res.status(400).json({ error: err.message });
    else res.json({ updatedID: id });
  });
};

exports.deletePlan = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM planos WHERE id = ?";
  db.run(sql, id, function(err) {
    if (err) res.status(400).json({ error: err.message });
    else res.json({ deletedID: id });
  });
};
