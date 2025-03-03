// controllers/assinanteController.js
const db = require('../config/db');
const moment = require('moment-timezone');

exports.createAssinante = (req, res) => {
  const { userid, plano_id, status } = req.body;
  if (!userid || !plano_id) {
    return res.status(400).json({ error: "userid e plano_id são obrigatórios" });
  }
  // Busca o plano para obter o tipo (mensal ou anual)
  const planSql = "SELECT tipo_plano FROM planos WHERE id = ?";
  db.get(planSql, [plano_id], (err, plan) => {
    if (err || !plan) {
      return res.status(400).json({ error: "Plano não encontrado" });
    }
    let now = moment().tz("America/Sao_Paulo");
    const data_compra = now.format('YYYY-MM-DD HH:mm:ss');
    const data_start = data_compra;
    let data_end;
    
    if (plan.tipo_plano.toLowerCase() === 'mensal') {
      data_end = now.add(1, 'month').format('YYYY-MM-DD HH:mm:ss');
    } else if (plan.tipo_plano.toLowerCase() === 'anual') {
      data_end = now.add(1, 'year').format('YYYY-MM-DD HH:mm:ss');
    } else {
      data_end = now.add(1, 'month').format('YYYY-MM-DD HH:mm:ss');
    }

    const sql = `INSERT INTO assinantes (userid, plano_id, data_compra, data_start, data_end, status)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [userid, plano_id, data_compra, data_start, data_end, status || 'ativo'];
    db.run(sql, params, function(err) {
      if (err) res.status(400).json({ error: err.message });
      else res.json({ id: this.lastID });
    });
  });
};

exports.getAssinantes = (req, res) => {
  const sql = "SELECT * FROM assinantes";
  db.all(sql, [], (err, rows) => {
    if (err) res.status(400).json({ error: err.message });
    else res.json(rows);
  });
};

exports.getAssinanteById = (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM assinantes WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) res.status(400).json({ error: err.message });
    else res.json(row);
  });
};

exports.updateAssinante = (req, res) => {
  const id = req.params.id;
  const { userid, plano_id, status } = req.body;
  const sql = `UPDATE assinantes SET 
                userid = COALESCE(?, userid),
                plano_id = COALESCE(?, plano_id),
                status = COALESCE(?, status)
              WHERE id = ?`;
  const params = [userid, plano_id, status, id];
  db.run(sql, params, function(err) {
    if (err) res.status(400).json({ error: err.message });
    else res.json({ updatedID: id });
  });
};

exports.deleteAssinante = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM assinantes WHERE id = ?";
  db.run(sql, id, function(err) {
    if (err) res.status(400).json({ error: err.message });
    else res.json({ deletedID: id });
  });
};
