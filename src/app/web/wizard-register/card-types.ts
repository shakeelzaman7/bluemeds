export const cardTypes = {
    patterns : [
        {
          type: 'visaelectron',
          pattern: /^4(026|17500|405|508|844|91[37])/,
          format: /(\d{1,4})/g,
          length: [16],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'visa',
          pattern: /^4/,
          format: /(\d{1,4})/g,
          length: [13, 16],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'mastercard',
          pattern: /^(5[1-5][0-9]{4}|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)([0-9]{2})/,
          format: /(\d{1,4})/g,
          length: [16],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'amex',
          pattern: /^3[47]/,
          format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
          length: [15],
          cvcLength: [4],
          luhn: true
        },
        {
          type: 'hipercard',
          pattern: /^(384100|384140|384160|606282|637095|637568|60(?!11))/,
          format: /(\d{1,4})/g,
          length: [14, 15, 16, 17, 18, 19],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'maestro',
          pattern: /^(5018|5020|5038|6304|6390[0-9]{2}|67[0-9]{4})/,
          format: /(\d{1,4})/g,
          length: [12, 13, 14, 15, 16, 17, 18, 19],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'dankort',
          pattern: /^5019/,
          format: /(\d{1,4})/g,
          length: [16],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'discover',
          pattern: /^(6011|65|64[4-9]|622)/,
          format: /(\d{1,4})/g,
          length: [16],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'unionpay',
          pattern: /^62/,
          format: /(\d{1,4})/g,
          length: [16, 17, 18, 19],
          cvcLength: [3],
          luhn: false
        },
        {
          type: 'jcb',
          pattern: /^35/,
          format: /(\d{1,4})/g,
          length: [16],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'dinersclub',
          pattern: /^3(?:[689]|(?:0[059]+))/,
          format: /(\d{1,4})(\d{1,6})?(\d{1,6})?/,
          length: [14, 16],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'elo',
          pattern: /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-7][0-9]|9000)|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|3[0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8])|9([2-6][0-9]|7[0-8])|541|700|720|901)|651652|655000|655021)/,
          format: /(\d{1,4})/g,
          length: [16],
          cvcLength: [3],
          luhn: true
        },
        {
          type: 'forbrugsforeningen',
          pattern: /^600/,
          format: /(\d{1,4})/g,
          length: [16],
          cvcLength: [3],
          luhn: true
        },
      ]
}