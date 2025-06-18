# Titon API

> **API para sistema de gestão de fretes e logística.**

---

## Table of Contents

1. [Purpose & Goals](#purpose--goals)
2. [Tech Stack & Key Decisions](#tech-stack--key-decisions)
3. [Project Structure](#project-structure)
4. [Out‑of‑the‑Box Features](#out-of-the-box-features)
5. [Getting Started](#getting-started)
6. [Cálculos Monetários e Valores no Banco](#cálculos-monetários-e-valores-no-banco)
7. [Roadmap](#roadmap)
8. [Contributing](#contributing)
9. [License](#license)

---

## Purpose & Goals

Esta API fornece uma **solução completa para gestão de fretes** e logística. Foca em:

- **Consistência & convenções compartilhadas** entre equipes.
- **Produtividade do desenvolvedor** — funcionalidades prontas, opinativo onde importa.
- **Futuro‑proofing** — dependências mínimas, upgrades fáceis, qualidade automatizada.
- **Observabilidade & segurança** integradas desde o início.

---

## Tech Stack & Key Decisions

| Layer              | Tool / Library             | Rationale                                  |
| ------------------ | -------------------------- | ------------------------------------------ |
| Runtime            | **Node.js 20 LTS**         | Latest LTS, native fetch, top‑level await  |
| HTTP Framework     | **Express 5**              | Small core, huge ecosystem                 |
| Validation         | **Joi**                    | Schema validation, reusable between layers |
| Database           | **PostgreSQL + Sequelize** | ORM hooks & transactions                   |
| Auth & Security    | JWT + Helmet + Rate‑limit  | Stateless tokens, secure headers           |
| Logging            | **Winston**                | JSON output, high performance              |
| Testing            | Jest + Supertest           | Unit & integration easily                  |
| File Storage       | AWS S3                     | Scalable file storage                      |
| Push Notifications | OneSignal                  | Real-time notifications                    |
| Maps Integration   | Google Maps API            | Route calculation & geocoding              |

---

## Project Structure

```text
app/
├─ api/v1/              # API versioning
│  ├─ base/             # Base classes & utilities
│  ├─ business/         # Business logic modules
│  │  ├─ driver/        # Driver management
│  │  ├─ freight/       # Freight management
│  │  ├─ manager/       # Manager management
│  │  └─ ...            # Other business modules
│  └─ main/             # Main application files
├─ providers/           # External service integrations
│  ├─ aws/              # AWS services
│  ├─ google/           # Google services
│  └─ oneSignal/        # Push notifications
└─ utils/               # Utility functions

database/
├─ migrations/          # Database migrations
├─ models/              # Sequelize models
└─ seedes/              # Database seeders

tests/                  # Test suites
config/                 # Configuration files
```

---

## Out‑of‑the‑Box Features

- **Health‑check & monitoring** (`/health`, `/metrics`).
- **Centralised error handler** – hides stack traces in production.
- **File upload & management** with AWS S3 integration.
- **Push notifications** with OneSignal integration.
- **Route calculation** with Google Maps API.
- **ESLint + Prettier** with pre‑commit hooks (Husky).

---

## Getting Started

```bash
# Clone the repo
$ git clone https://github.com/<your‑org>/titon-api.git
$ cd titon-api

# Configure environment variables
$ cp env.sample .env

# Install dependencies
$ yarn install

# Start database with Docker
$ docker compose up -d

# Run migrations
$ yarn sequelize db:migrate

# Start development server
$ yarn dev
```

Navigate to `http://localhost:3000` for the API.

---

## Cálculos Monetários e Valores no Banco

### Padrão de Armazenamento

O sistema utiliza um padrão consistente para armazenar valores monetários e numéricos no banco de dados:

#### Valores Monetários (em centavos)

Todos os valores monetários são armazenados **multiplicados por 100** para evitar problemas com decimais:

| Valor Real  | Valor no Banco | Exemplo                    |
| ----------- | -------------- | -------------------------- |
| R$ 100,00   | 10000          | `ton_value: 10000`         |
| R$ 5,50     | 550            | `estimated_fuel_cost: 550` |
| R$ 1.250,75 | 125075         | `toll_cost: 125075`        |

#### Média de Consumo (km/l)

A média de consumo do caminhão segue o mesmo padrão:

| Média Real | Valor no Banco | Exemplo                |
| ---------- | -------------- | ---------------------- |
| 2.5 km/l   | 250            | `fuel_avg_per_km: 250` |
| 3.0 km/l   | 300            | `fuel_avg_per_km: 300` |
| 1.8 km/l   | 180            | `fuel_avg_per_km: 180` |

### Cálculos no Sistema

#### 1. Cálculo de Valor Total do Frete

```javascript
// Exemplo: 25 toneladas a R$ 200,00 por tonelada
const estimatedTonnage = 25000; // 25 toneladas em kg
const tonValue = 20000; // R$ 200,00 em centavos

const totalFreightInCents = (estimatedTonnage / 1000) * tonValue;
// (25000 / 1000) * 20000 = 25 * 20000 = 500000 centavos = R$ 5.000,00
```

#### 2. Cálculo de Litros Consumidos

```javascript
// Exemplo: 500km de viagem, média de 2.5 km/l
const distance = 500000; // metros (500km)
const fuelAvgPerKm = 250; // 2.5 × 100

const distanceInKm = distance / 1000; // 500
const consumptionLt = fuelAvgPerKm / 100; // 2.5
const totalLiters = distanceInKm / consumptionLt; // 200 litros
```

#### 3. Cálculo de Valor Total Gasto

```javascript
const totalLiters = 200;
const fuelValue = 550; // R$ 5,50 em centavos

const totalAmountSpentInCents = totalLiters * fuelValue;
// 200 * 550 = 110000 centavos = R$ 1.100,00
```

### Formatação para Frontend

#### Valores Monetários

```javascript
_formatRealValue(value) {
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    return formatter.format(value);
}

// Uso:
const formattedValue = this._formatRealValue(totalAmountSpentInCents / 100);
// "R$ 1.100,00"
```

#### Média de Consumo

```javascript
// Exibição: "2.5 M" (M = média)
previous_average: `${fuel_avg_per_km / 100} M`;
```

### Conversões no Frontend

#### Para Enviar ao Backend

```javascript
// Valor monetário
const sendMoneyValue = (realValue) => Math.round(realValue * 100);

// Média de consumo
const sendFuelAverage = (realValue) => Math.round(realValue * 100);
```

#### Para Exibir no Frontend

```javascript
// Valor monetário
const displayMoney = (storedValue) => (storedValue / 100).toFixed(2);

// Média de consumo
const displayFuelAverage = (storedValue) => (storedValue / 100).toFixed(1);
```

### Benefícios do Padrão

1. **Precisão:** Evita problemas com arredondamento de decimais
2. **Consistência:** Todos os valores seguem o mesmo padrão
3. **Performance:** Operações com inteiros são mais rápidas
4. **Manutenibilidade:** Código mais claro e previsível

---

## Roadmap

- [ ] **TypeScript migration** for better type safety
- [ ] **Redis cache layer** for improved performance
- [ ] **GraphQL API** for flexible data queries
- [ ] **Real-time features** with WebSocket integration
- [ ] **Advanced analytics** and reporting
- [ ] **Mobile app API** optimization

---

## Contributing

1. Fork the repo & create your branch: `git checkout -b feature/my‑feature`
2. Run lint & tests: `yarn lint && yarn test`
3. Commit & push, then open a PR.

We follow Conventional Commits — please keep messages tidy.

---

## License

Released under the **MIT License**. See `LICENSE` for details.
