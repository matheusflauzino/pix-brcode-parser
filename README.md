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

const resultado = parseBRCode(' 000201 ');
console.log(resultado);
// => { raw: '000201' }
```

## Desenvolvimento

- Compilar o projeto: `npm run build`
- Executar os testes: `npm test`

## Licença

MIT
