// config/db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err.message);
  } else {
    console.log("Conectado ao SQLite.");
  }
});

//Criação das tabelas
db.serialize(() => {
  // Tabela de usuários
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    macid TEXT NOT NULL,
    data_cadastro TEXT DEFAULT (datetime('now')),
    cpf TEXT,
    status TEXT,
    password TEXT
  )`);

  // Tabela de planos
  db.run(`CREATE TABLE IF NOT EXISTS planos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_plano TEXT,
    tipo_plano TEXT,   -- 'mensal' ou 'anual'
    preco REAL,
    status TEXT
  )`);

  // Tabela de assinantes
  db.run(`CREATE TABLE IF NOT EXISTS assinantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userid INTEGER,
    plano_id INTEGER,
    data_compra TEXT,
    data_start TEXT,
    data_end TEXT,
    status TEXT,
    FOREIGN KEY(userid) REFERENCES usuarios(uid),
    FOREIGN KEY(plano_id) REFERENCES planos(id)
  )`);
});

module.exports = db;
