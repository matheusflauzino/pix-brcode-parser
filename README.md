# pix-brcode-parser

Conversor e parser de BR Codes (QR Codes do PIX) em JavaScript/TypeScript.

Este projeto fornece uma função simples para limpar e extrair o código bruto a partir de uma string contendo um BR Code.

## Instalação

```bash
npm install pix-brcode-parser
```

## Uso

```typescript
import { parseBRCode } from 'pix-brcode-parser';

const code =
  '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304ABCD';

const resultado = parseBRCode(code);
console.log(resultado.type); // "DYNAMIC"
console.log(resultado.pixKey); // "abc@example.com"
```

## Desenvolvimento

- Compilar o projeto: `npm run build`
- Executar os testes: `npm test`

## Licença

MIT
