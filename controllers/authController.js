// controllers/authController.js
const db = require('../config/db');

/**
 * Realiza o login de um usuário.
 * 
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 * @property {string} macid - O MAC ID do usuário.
 * @property {string} token - O token de login do usuário.
 * @returns {Object} Objeto de resposta com um status de 200 e o usuário.
 */
exports.login = (req, res) => {
  const { macid, token } = req.body;

  if (!macid || !token) {
    return res.status(400).json({ error: "macid e token são obrigatórios" });
  }

  const sql = "SELECT * FROM usuarios WHERE macid = ?";
  db.get(sql, [macid], (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    // Aqui, assumimos que o campo "password" é o token de login
    if (user.password !== token) {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.json({ message: "Login realizado com sucesso", user });
  });
};
