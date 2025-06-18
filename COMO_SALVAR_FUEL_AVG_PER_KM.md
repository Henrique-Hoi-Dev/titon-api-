# Como Salvar o Valor da Média de Consumo do Caminhão

## Análise do Código Atual

### Como está sendo usado:

1. **No cálculo de litros consumidos:**

```javascript
_calculatesLiters(distance, consumption) {
    const distanceInKm = distance / 1000;
    const consumptionLt = consumption / 100; // Divide por 100 aqui

    const calculate = distanceInKm / consumptionLt;
    return Number(calculate.toFixed(0));
}
```

2. **Na exibição:**

```javascript
previous_average: `${freight.fuel_avg_per_km / 100} M`,
```

3. **No modelo:**

```javascript
fuel_avg_per_km: DataTypes.INTEGER, // Média de consumo (ex: litros/100km ou ml/km)
```

## Interpretação do Padrão Atual

Baseado no código, o sistema está usando o seguinte padrão:

- **Valor salvo no banco:** Multiplicado por 100 (para evitar decimais)
- **Valor real:** Dividido por 100 para obter o valor real
- **Unidade:** Litros por 100km

## Resposta à Sua Pergunta

**Para uma média de 2.5 km/l (ou 2.5 L/100km), você deve salvar: `250`**

### Exemplos:

| Média Real | Valor para Salvar | Explicação      |
| ---------- | ----------------- | --------------- |
| 2.5 km/l   | 250               | 2.5 × 100 = 250 |
| 3.0 km/l   | 300               | 3.0 × 100 = 300 |
| 1.8 km/l   | 180               | 1.8 × 100 = 180 |
| 4.2 km/l   | 420               | 4.2 × 100 = 420 |

## Como o Sistema Processa

### 1. Cálculo de Litros Consumidos:

```javascript
// Exemplo: 500km de viagem, média de 2.5 km/l
const distance = 500000; // metros (500km)
const fuelAvgPerKm = 250; // 2.5 × 100

const distanceInKm = 500000 / 1000 = 500;
const consumptionLt = 250 / 100 = 2.5;
const totalLiters = 500 / 2.5 = 200 litros;
```

### 2. Exibição:

```javascript
// Valor salvo: 250
// Exibição: "2.5 M" (M = média)
previous_average: `${250 / 100} M`; // "2.5 M"
```

## Recomendações

### 1. **Padrão Recomendado:**

- Salve sempre multiplicando por 100
- Use a unidade "km/l" ou "L/100km" consistentemente
- Documente claramente a unidade usada

### 2. **Validação no Frontend:**

```javascript
// Exemplo de validação
const validateFuelAverage = (value) => {
    const realValue = value / 100;
    if (realValue < 1 || realValue > 10) {
        throw new Error('Média de consumo deve estar entre 1.0 e 10.0 km/l');
    }
    return value;
};
```

### 3. **Conversão no Frontend:**

```javascript
// Para enviar para o backend
const sendToBackend = (realValue) => {
    return Math.round(realValue * 100);
};

// Para exibir no frontend
const displayValue = (storedValue) => {
    return (storedValue / 100).toFixed(1);
};
```

## Exemplo Prático

```javascript
// Usuário informa: 2.5 km/l
const userInput = 2.5;

// Salva no banco:
const valueToSave = Math.round(userInput * 100); // 250

// No cálculo:
const consumptionLt = valueToSave / 100; // 2.5
const totalLiters = distanceInKm / consumptionLt;

// Na exibição:
const displayValue = `${valueToSave / 100} M`; // "2.5 M"
```

## Conclusão

**Para uma média de 2.5 km/l, salve `250` no banco de dados.**

Este padrão mantém a consistência com outros campos monetários que também usam multiplicação por 100 para evitar problemas com decimais.
