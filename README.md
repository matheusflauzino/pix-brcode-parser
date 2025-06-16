# pix-brcode-parser

**Observação importante:** esta biblioteca foi criada 100% com o agente Codex do ChatGPT, como um experimento para avaliar o quão útil ele é no desenvolvimento de software. Todo o código foi gerado utilizando esse agente!

## Descrição

`pix-brcode-parser` é uma pequena biblioteca em JavaScript/TypeScript para converter e interpretar BR Codes (os QR Codes do PIX).

## Instalação

```bash
npm install pix-brcode-parser
```

## Exemplo de uso

```typescript
import { parseBRCode } from 'pix-brcode-parser';

const code =
  '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304ABCD';

const resultado = parseBRCode(code);
console.log(resultado.type);    // "DYNAMIC"
console.log(resultado.pixKey);  // "abc@example.com"
```

## Campos retornados por `parseBRCode`

- `raw` – código sanitizado utilizado para o parse
- `type` – "STATIC" ou "DYNAMIC"
- `payloadFormatIndicator`
- `merchantCategoryCode`
- `transactionCurrency`
- `transactionAmount`
- `countryCode`
- `merchantName`
- `merchantCity`
- `postalCode`
- `txid`
- `pixKey`
- `infoAdicional`

## Manual do BR Code

Para mais detalhes sobre o padrão BR Code consulte o [Manual do BR Code do Bacen](https://www.bcb.gov.br/content/estabilidadefinanceira/spi/ManualBRCode.pdf).

## Desenvolvimento

- Compilar o projeto: `npm run build`
- Executar os testes: `npm test`

## Licença

MIT
