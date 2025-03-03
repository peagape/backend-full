// controllers/userController.js
const e = require('express');
const db = require('../config/db');
const moment = require('moment-timezone');

/**
 * Cria um novo usuário.
 * 
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @property {string} nome - O nome do usuário.
 * @property {string} email - O email do usuário.
 * @property {string} macid - O MAC ID do usuário.
 * @property {string} [cpf] - O CPF do usuário (opcional).
 * @property {string} [status] - O status do usuário (opcional, padrão = 'ativo').
 * @property {string} [password] - A senha do usuário (opcional, padrão = null).
 * @returns {Object} Objeto de resposta com um status de 201 e o ID do usuário recém-criado.
 */
exports.createUser = (req, res) => {
  const token = req.headers.authorization;
    if (token==='Bearer 34e67a828393b5f7687f8c67c668769684a6d6ecacdb8367de34869c827bf748') {

    const { nome, email, macid, board, cpf, status, password } = req.body;
    
    if (!nome || !email || !macid) {
      return res.status(400).json({ error: "nome, email e macid são obrigatórios" });
    }
    
    // Verifica se o email ou macid já existem
    const checkSql = "SELECT * FROM usuarios WHERE email = ? OR macid = ? OR board = ?";
    db.get(checkSql, [email, macid, board], (err, row) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (row) {
        return res.status(400).json({ error: "Oops" }); //Email ou MAC ID já cadastrado
      }
      
      const dataCadastro = moment().tz("America/Sao_Paulo").format('YYYY-MM-DD HH:mm:ss');
      const sql = `INSERT INTO usuarios (nome, email, macid, board, cpf, status, password, data_cadastro)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [nome, email, macid, board, cpf || null, status || null, password || null, dataCadastro];
      
      db.run(sql, params, function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.json({ uid: this.lastID });
      });
    });
  }else{
    res.status(401).json({ error: "Nao autorizado" });
  }

  };


exports.getUsers = (req, res) => {
  // verifcar se tem o token passado via header
  const token = req.headers.authorization;
  if (token==='Bearer 34e67a828393b5f7687f8c67c668769684a6d6ecacdb8367de34869c827bf748') {
    const sql = "SELECT * FROM usuarios";
    db.all(sql, [], (err, rows) => {
      if (err) res.status(400).json({ error: err.message });
      else res.json(rows);
    });
  }else{
    res.status(401).json({ error: "Nao autorizado" });
  }
};

/**
 * Retorna um usuário pelo seu ID.
 * 
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @property {number} uid - O ID do usuário.
 * @returns {Object} Objeto de resposta com um status de 200 e o usuário.
 */
exports.getUserById = (req, res) => {
    // verifcar se tem o token passado via header
  const token = req.headers.authorization;
    if (token==='Bearer 34e67a828393b5f7687f8c67c668769684a6d6ecacdb8367de34869c827bf748') {
      const uid = req.params.uid;
      const sql = "SELECT * FROM usuarios WHERE uid = ?";
      db.get(sql, [uid], (err, row) => {
        if (err) res.status(400).json({ error: err.message });
        else res.json(row);
      });
    }else{
      res.status(401).json({ error: "Nao autorizado" });
    }
};

exports.updateUser = (req, res) => {

  const token = req.headers.authorization;
  if (token==='Bearer 34e67a828393b5f7687f8c67c668769684a6d6ecacdb8367de34869c827bf748') {
    const uid = req.params.uid;
    const { nome, email, macid, cpf, status, password } = req.body;
    const sql = `UPDATE usuarios SET 
                  nome = COALESCE(?, nome),
                  email = COALESCE(?, email),
                  macid = COALESCE(?, macid),
                  cpf = COALESCE(?, cpf),
                  status = COALESCE(?, status),
                  password = COALESCE(?, password)
                WHERE uid = ?`;
    const params = [nome, email, macid, cpf, status, password, uid];
    db.run(sql, params, function(err) {
      if (err) res.status(400).json({ error: err.message });
      else res.json({ updatedID: uid });
    });
  }else{
    res.status(401).json({ error: "Nao autorizado" });
  }
};

/**
 * Deleta um usuário pelo seu ID.
 * 
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @property {number} uid - O ID do usuário.
 * @returns {Object} Objeto de resposta com um status de 200 e o ID do usuário excluído.
 */
exports.deleteUser = (req, res) => {
  const token = req.headers.authorization;
    if (token==='Bearer 34e67a828393b5f7687f8c67c668769684a6d6ecacdb8367de34869c827bf748') {
      const uid = req.params.uid;
      const sql = "DELETE FROM usuarios WHERE uid = ?";
      db.run(sql, uid, function(err) {
        if (err) res.status(400).json({ error: err.message });
        else res.json({ deletedID: uid });
      });
}else{
  res.status(401).json({ error: "Nao autorizado" });
}
};


// Rota para retornar informações do usuário com seu plano
// exports.getUserInfo = (req, res) => {
//     const uid = req.params.uid;
//     const sql = `
//       SELECT u.*, a.data_compra, a.data_start, a.data_end, a.status AS assinatura_status,
//              p.nome_plano, p.tipo_plano, p.preco, p.status AS plano_status
//       FROM usuarios u
//       LEFT JOIN (
//         SELECT * FROM assinantes
//         WHERE userid = ?
//         ORDER BY id DESC
//         LIMIT 1
//       ) a ON u.uid = a.userid
//       LEFT JOIN planos p ON a.plano_id = p.id
//       WHERE u.uid = ?
//     `;
//     db.get(sql, [uid, uid], (err, row) => {
//       if (err) res.status(400).json({ error: err.message });
//       else res.json(row);
//     });
//   };

/**
 * Retorna informações do usuário e seu plano mais recente baseado no MAC ID.
 * 
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @property {string} macid - O MAC ID do usuário.
 * @returns {Object} Objeto de resposta com informações do usuário e os detalhes do plano mais recente.
 *                   Inclui data de compra, data de início, data de término, status da assinatura,
 *                   nome do plano, tipo do plano, preço e status do plano.
 */

exports.getUserInfo = (req, res) => {
  const token = req.headers.authorization;
    if (token==='Bearer 34e67a828393b5f7687f8c67c668769684a6d6ecacdb8367de34869c827bf748') {

    const macid = req.params.macid;
    const sql = `
      SELECT 
        u.*,
        (SELECT a.data_compra 
           FROM assinantes a 
          WHERE a.userid = u.uid 
          ORDER BY a.id DESC 
          LIMIT 1) AS data_compra,
        (SELECT a.data_start 
           FROM assinantes a 
          WHERE a.userid = u.uid 
          ORDER BY a.id DESC 
          LIMIT 1) AS data_start,
        (SELECT a.data_end 
           FROM assinantes a 
          WHERE a.userid = u.uid 
          ORDER BY a.id DESC 
          LIMIT 1) AS data_end,
        (SELECT a.status 
           FROM assinantes a 
          WHERE a.userid = u.uid 
          ORDER BY a.id DESC 
          LIMIT 1) AS assinatura_status,
        (SELECT p.nome_plano 
           FROM assinantes a 
           JOIN planos p ON a.plano_id = p.id 
          WHERE a.userid = u.uid 
          ORDER BY a.id DESC 
          LIMIT 1) AS nome_plano,
        (SELECT p.tipo_plano 
           FROM assinantes a 
           JOIN planos p ON a.plano_id = p.id 
          WHERE a.userid = u.uid 
          ORDER BY a.id DESC 
          LIMIT 1) AS tipo_plano,
        (SELECT p.preco 
           FROM assinantes a 
           JOIN planos p ON a.plano_id = p.id 
          WHERE a.userid = u.uid 
          ORDER BY a.id DESC 
          LIMIT 1) AS preco,
        (SELECT p.status 
           FROM assinantes a 
           JOIN planos p ON a.plano_id = p.id 
          WHERE a.userid = u.uid 
          ORDER BY a.id DESC 
          LIMIT 1) AS plano_status
      FROM usuarios u
      WHERE u.macid = ?
    `;
    db.get(sql, [macid], (err, row) => {
      if (err) res.status(400).json({ error: err.message });
      else res.json(row);
    });
  }else{
    res.status(401).json({ error: "Nao autorizado" });
  }
  };