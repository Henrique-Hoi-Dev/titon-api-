module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('deposit_moneys', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            registration_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            financial_statements_id: {
                type: Sequelize.INTEGER,
                references: { model: 'financial_statements', key: 'id' },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            freight_id: {
                type: Sequelize.INTEGER,
                references: { model: 'freights', key: 'id' },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            type_transaction: {
                type: Sequelize.ENUM,
                values: ['DIRECT_DEPOSIT', 'BANK_TRANSFER', 'CHECK_DEPOSIT', 'CASH_DEPOSIT'],
            },
            local: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            type_bank: {
                type: Sequelize.ENUM,
                values: [
                    'BANCO_DO_BRASIL',
                    'CAIXA_ECONOMICA',
                    'ITAU_UNIBANCO',
                    'BRADESCO',
                    'SANTANDER_BRASIL',
                    'BANCO_SAFRA',
                    'BANCO_BTG_PACTUAL',
                    'BANCO_SICOOB',
                    'BANCO_SICREDI',
                    'BANRISUL',
                    'BANCO_VOTORANTIM',
                    'BANCO_INTER',
                    'BANCO_ORIGINAL',
                    'BANCO_BMG',
                    'BANCO_MERCANTIL_DO_BRASIL',
                    'BANCO_MODAL',
                    'BANCO_C6',
                    'NEON_PAGAMENTOS',
                    'NUBANK',
                    'XP_INVESTIMENTOS',
                ],
            },
            value: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            img_receipt: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            payment: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {
                    modo: '',
                    value: 0,
                    parcels: 0,
                    flag: '',
                },
                validate: {
                    notEmpty: true,
                },
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('deposit_moneys');
    },
};
