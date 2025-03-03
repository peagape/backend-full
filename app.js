// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Importa as rotas
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const assinanteRoutes = require('./routes/assinanteRoutes');
const authRoutes = require('./routes/authRoutes');
//const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/usuarios', userRoutes);
app.use('/planos', planRoutes);
app.use('/assinantes', assinanteRoutes);
app.use('/auth', authRoutes);
//app.use('/admin', adminRoutes);
app.use('/', paymentRoutes); // Monta a rota /playment

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
