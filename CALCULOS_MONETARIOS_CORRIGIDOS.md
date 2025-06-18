# Correções nos Cálculos Monetários - FreightService

## Problemas Identificados

### 1. Inconsistência no Tratamento de Valores em Centavos

**Problema:** Os valores no banco de dados estão armazenados em centavos, mas alguns cálculos estavam dividindo esses valores por 100 antes de fazer as operações matemáticas, causando resultados incorretos.

**Exemplo do problema:**

```javascript
// ANTES (INCORRETO)
const fuelValueReal = fuelValue / 100; // fuelValue já está em centavos
const calculate = totalLiters * fuelValueReal;
return this._formatRealValue(calculate.toFixed(2));
```

**Correção:**

```javascript
// DEPOIS (CORRETO)
const calculate = totalLiters * fuelValue; // fuelValue em centavos
return this._formatRealValue(calculate / 100); // Divide por 100 apenas na formatação
```

### 2. Cálculos com Valores Formatados

**Problema:** O método `_unmaskMoney` estava sendo usado para converter valores já formatados (strings) de volta para números, mas a lógica estava incorreta.

**Problema anterior:**

```javascript
_unmaskMoney(string) {
    return Number(string.toString().replace('.', '').replace('.', '').replace(/\D/g, ''));
}
```

**Correção:**

```javascript
_unmaskMoney(string) {
    if (typeof string === 'string') {
        // Remove todos os caracteres não numéricos exceto vírgula e ponto
        const cleanString = string.replace(/[^\d,.-]/g, '');
        // Substitui vírgula por ponto para conversão
        const numberString = cleanString.replace(',', '.');
        // Converte para número e multiplica por 100 para obter centavos
        return Math.round(parseFloat(numberString) * 100);
    }
    return Number(string);
}
```

## Correções Aplicadas

### 1. Métodos de Cálculo Corrigidos

#### `_valueTotalGasto`

- **Antes:** Dividia o valor do combustível por 100 antes do cálculo
- **Depois:** Usa o valor em centavos diretamente e divide por 100 apenas na formatação

#### `_valueTotalTonne`

- **Antes:** Dividia o valor por tonelada por 100 antes do cálculo
- **Depois:** Usa o valor em centavos diretamente e divide por 100 apenas na formatação

#### `_valueDriver`

- **Antes:** Convertia valores formatados de volta para números incorretamente
- **Depois:** Trabalha diretamente com valores em centavos

### 2. Métodos Principais Refatorados

#### `getIdManagerFreight`

- Calcula todos os valores em centavos primeiro
- Aplica formatação apenas no final
- Evita conversões desnecessárias entre formatos

#### `firstCheckId`

- Mesma abordagem: cálculos em centavos, formatação no final
- Resultados mais precisos e consistentes

## Estrutura de Dados no Banco

### Campos Monetários (em centavos):

- `estimated_fuel_cost`: Valor previsto do diesel em centavos
- `ton_value`: Valor por tonelada em centavos
- `toll_cost`: Valor do pedágio em centavos

### Campos de Peso:

- `estimated_tonnage`: Tonelada prevista em kg (ex: 25000 = 25t)
- `tons_loaded`: Tonelada carregada real em kg

### Campos de Consumo:

- `fuel_avg_per_km`: Média de consumo (ex: litros/100km ou ml/km)

## Exemplo de Cálculo Correto

```javascript
// Exemplo: Frete de 25 toneladas a R$ 200,00 por tonelada
const estimatedTonnage = 25000; // 25 toneladas em kg
const tonValue = 20000; // R$ 200,00 em centavos

// Cálculo correto:
const totalFreightInCents = (estimatedTonnage / 1000) * tonValue;
// (25000 / 1000) * 20000 = 25 * 20000 = 500000 centavos = R$ 5.000,00

const totalFreight = this._formatRealValue(totalFreightInCents / 100);
// "R$ 5.000,00"
```

## Benefícios das Correções

1. **Precisão:** Cálculos mais precisos sem perda de informação
2. **Consistência:** Todos os cálculos seguem o mesmo padrão
3. **Manutenibilidade:** Código mais claro e fácil de entender
4. **Performance:** Menos conversões desnecessárias entre formatos

## Recomendações

1. **Padronização:** Sempre trabalhe com valores em centavos nos cálculos
2. **Formatação:** Aplique formatação apenas na apresentação para o frontend
3. **Validação:** Adicione validações para garantir que os valores estão no formato correto
4. **Testes:** Crie testes unitários para validar os cálculos monetários
