/**
 * Função para formatar cada campo no padrão: ID + tamanho (2 dígitos) + valor.
 */
function formatField(id, value) {
  const len = value.length.toString().padStart(2, '0');
  return id + len + value;
}

/**
 * Monta o campo Merchant Account Information (tag 26) contendo:
 * - "00": Identificador do sistema (sempre "br.gov.bcb.pix")
 * - "01": A chave Pix
 * - "02": (Opcional) Mensagem/descrição do pagamento
 */
function buildMerchantAccountInfo(pixKey, message = 'PEDIDOEZPROXY') {
  let info = formatField("00", "br.gov.bcb.pix") + formatField("01", pixKey);
  if (message) {
    info += formatField("02", message);
  }
  return info;
}

/**
 * Monta o campo Additional Data Field Template (tag 62) contendo:
 * - "05": Identificador da transação (txid), se não informado, utiliza "***"
 */
function buildAdditionalDataField(transactionId = '***') {
  return formatField("05", transactionId);
}

/**
 * Calcula o CRC16/CCITT-FALSE para o payload.
 */
function calculateCRC16(payload) {
  const polynomial = 0x1021;
  let crc = 0xFFFF;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xFFFF; // Mantém 16 bits
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Gera o payload Pix conforme a especificação.
 * 
 * Parâmetros:
 * - pixKey: chave Pix do recebedor;
 * - merchantName: nome do recebedor;
 * - merchantCity: cidade do recebedor;
 * - transactionAmount: valor da transação (opcional);
 * - transactionId: identificador da transação (opcional);
 * - message: mensagem/descrição do pagamento (opcional).
 */
function generatePixPayload({ pixKey, merchantName, merchantCity, transactionAmount, transactionId, message }) {
  let payload = '';

  // 00 - Payload Format Indicator (sempre "01")
  payload += formatField("00", "01");

  // 01 - Point of Initiation Method (por exemplo, "12" para cobrança dinâmica)
  payload += formatField("01", "12");

  // 26 - Merchant Account Information (inclui a mensagem no subcampo "02", se fornecida)
  payload += formatField("26", buildMerchantAccountInfo(pixKey, message));

  // 52 - Merchant Category Code (pode ser "0000")
  payload += formatField("52", "0000");

  // 53 - Currency (986 para Real)
  payload += formatField("53", "986");

  // 54 - Valor da transação (opcional)
  if (transactionAmount) {
    const formattedAmount = Number(transactionAmount).toFixed(2);
    payload += formatField("54", formattedAmount);
  }

  // 58 - País (BR)
  payload += formatField("58", "BR");

  // 59 - Nome do recebedor
  payload += formatField("59", merchantName);

  // 60 - Cidade do recebedor
  payload += formatField("60", merchantCity);

  // 62 - Additional Data Field (apenas com o txid)
  payload += formatField("62", buildAdditionalDataField(`EZPROXY${transactionId}`));

  // 63 - CRC (ainda sem valor)
  payload += "6304";

  // Calcula o CRC e adiciona ao payload
  const crc = calculateCRC16(payload);
  payload += crc;

  return payload;
}

module.exports = generatePixPayload;