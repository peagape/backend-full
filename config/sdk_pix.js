

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
   */
  function buildMerchantAccountInfo(pixKey) {
    return formatField("00", "br.gov.bcb.pix") + formatField("01", pixKey);
  }
  
  /**
   * Monta o campo Additional Data Field Template (tag 62), por exemplo, contendo
   * um identificador da transação. Se não informado, utiliza "***" (valor fixo para QR Code estático).
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
      crc &= 0xFFFF; // Garante que o valor fique em 16 bits
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
   * - transactionId: identificador da transação (opcional).
   */
  function generatePixPayload({ pixKey, merchantName, merchantCity, transactionAmount, transactionId }) {
    let payload = '';
  
    // 00 - Payload Format Indicator (sempre "01")
    payload += formatField("00", "01");
  
    // 01 - Point of Initiation Method (utilizando "12" para cobrança dinâmica)
    payload += formatField("01", "12");
  
    // 26 - Merchant Account Information
    payload += formatField("26", buildMerchantAccountInfo(pixKey));
  
    // 52 - Merchant Category Code (pode ser "0000" se não houver)
    payload += formatField("52", "0000");
  
    // 53 - Currency (986 para Real)
    payload += formatField("53", "986");
  
    // 54 - Valor da transação (opcional)
    if (transactionAmount) {
      // Formata com duas casas decimais
      const formattedAmount = Number(transactionAmount).toFixed(2);
      payload += formatField("54", formattedAmount);
    }
  
    // 58 - País (BR para Brasil)
    payload += formatField("58", "BR");
  
    // 59 - Nome do recebedor
    payload += formatField("59", merchantName);
  
    // 60 - Cidade do recebedor
    payload += formatField("60", merchantCity);
  
    // 62 - Additional Data Field (pode incluir o identificador da transação)
    payload += formatField("62", buildAdditionalDataField(`EZPROXY${transactionId}`));
  
    // 63 - CRC (aqui é adicionado o identificador e o tamanho, mas sem valor ainda)
    payload += "6304";
  
    // Calcula o CRC e adiciona ao payload
    const crc = calculateCRC16(payload);
    payload += crc;
  
    return payload;
  }
  
  module.exports = generatePixPayload;