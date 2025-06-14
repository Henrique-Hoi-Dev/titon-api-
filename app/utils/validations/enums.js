import Joi from 'joi';

// Enums para Cart (Carreta)
export const CART_BODYWORKS_ENUM = ['TANK', 'BULKCARRIER', 'SIDER', 'CHEST', 'BUCKET'];
export const cartBodyworksSchema = Joi.string().valid(...CART_BODYWORKS_ENUM);

// Enums para Driver (Motorista)
export const DRIVER_STATUS_ENUM = ['ACTIVE', 'INACTIVE', 'INCOMPLETE'];
export const driverStatusSchema = Joi.string().valid(...DRIVER_STATUS_ENUM);

// Enums para Manager/Users (Usuários)
export const USER_ROLE_ENUM = ['MASTER', 'USER', 'MANAGER', 'DIRECTOR', 'COLLABORATOR'];
export const userRoleSchema = Joi.string().valid(...USER_ROLE_ENUM);

// Enums para Credit (Crédito)
export const TRASACTIONS_TYPE_METHOD_ENUM = ['DEBIT', 'CREDIT'];
export const trasactionsTypeMethodSchema = Joi.string().valid(...TRASACTIONS_TYPE_METHOD_ENUM);

// Enums para Freight (Frete)
export const FREIGHT_STATUS_ENUM = [
    'DRAFT',
    'PENDING',
    'APPROVED',
    'STARTING_TRIP',
    'DENIED',
    'FINISHED'
];
export const freightStatusSchema = Joi.string().valid(...FREIGHT_STATUS_ENUM);

// Enums para Deposit Money (Depósito)
export const DEPOSIT_TYPE_ENUM = [
    'DIRECT_DEPOSIT',
    'BANK_TRANSFER',
    'CHECK_DEPOSIT',
    'CASH_DEPOSIT'
];
export const depositTypeSchema = Joi.string().valid(...DEPOSIT_TYPE_ENUM);

// Enums para Brazilian Banks (Bancos Brasileiros)
export const BRAZILIAN_BANKS_ENUM = [
    'BANCO_DO_BRASIL',
    'CAIXA_ECONOMICA',
    'ITAU',
    'BRADESCO',
    'SANTANDER',
    'NUBANK',
    'INTER',
    'OUTROS'
];
export const brazilianBanksSchema = Joi.string().valid(...BRAZILIAN_BANKS_ENUM);

// Exporta todos os schemas em um objeto
export const enumSchemas = {
    cartBodyworks: cartBodyworksSchema,
    driverStatus: driverStatusSchema,
    userRole: userRoleSchema,
    trasactionsTypeMethod: trasactionsTypeMethodSchema,
    freightStatus: freightStatusSchema,
    depositType: depositTypeSchema,
    brazilianBanks: brazilianBanksSchema
};
