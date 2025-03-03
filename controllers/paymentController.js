// controllers/paymentController.js
const db = require('../config/db');
const QRCode = require('qrcode');
const moment = require('moment-timezone');
const generatePixPayload = require('../config/sdk_pix');

// function generatePixPayload(pixKey, amount) {
//   // Gera um payload dummy para PIX.
//   // Em uma implementação real, utilize uma biblioteca que gere um payload válido conforme o padrão do PIX.
//   let amountStr = Number(amount).toFixed(2);
//   let payload = `000201010212265800${pixKey}520400005303986540${amountStr}6304ABCD`;
//   return payload;
// }

exports.createPayment = (req, res) => {
  
  const user_id = req.body.user_id;
  const id_plano = req.body.id_plano;
  const macid = user_id;

  if (!macid || !id_plano) {
    return res.status(400).json({ error: "User_id e id_plano são obrigatórios" });
  }
  
  // Busca o usuário pelo macid
  const userSql = "SELECT uid FROM usuarios WHERE macid = ?";
  db.get(userSql, [macid], (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    const userId = user.uid;
    
    // Busca o plano para obter o preço
    const planSql = "SELECT * FROM planos WHERE id = ?";
    db.get(planSql, [id_plano], (err, plan) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!plan) {
        return res.status(404).json({ error: "Plano não encontrado" });
      }
      const amount = plan.preco;
      
      // AAAAAAAAAAA

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

        db.run(sql, [userId, id_plano, data_compra, data_start, data_end, "pendente"], function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        // Geração do PIX payload e QR Code
        const pixKey = process.env.PIX_KEY;
        if (!pixKey) {
          return res.status(500).json({ error: "PIX_KEY não configurada no ambiente" });
        }

        const merchantName = "EZPROXY";
        const merchantCity = "SP";
        const transactionId = this.lastID;
        const transactionAmount = amount;

        /**
         * Gera o payload Pix conforme a especificação.
         * 
         * Parâmetros:
         * - pixKey: chave Pix do recebedor;
         * - merchantName: nome do recebedor;
         * - merchantCity: cidade do recebedor;
         * - transactionAmount: valor da transação (opcional);
         * - transactionId: identificador da transação (opcional).
         */
        

        // Gera o payload Pix
        const payload = generatePixPayload({ pixKey, merchantName, merchantCity, transactionAmount, transactionId });

        console.log({ pixKey, merchantName, merchantCity, transactionAmount, transactionId });
        console.log(payload);


        //const payload = generatePixPayload(pixKey, amount);

        QRCode.toDataURL(payload, { errorCorrectionLevel: 'M' }, (err, qrCodeUrl) => {
          if (err) {
            return res.status(500).json({ error: "Erro ao gerar QR Code" });
          }
          return res.json({
            payload: payload,
            qrCodeUrl: qrCodeUrl
          });
        });
      });
    });
  });
};
