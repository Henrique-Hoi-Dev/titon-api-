module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('travel_expenses', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            financial_statements_id: {
                type: Sequelize.INTEGER,
                references: { model: 'financial_statements', key: 'id' },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            freight_id: {
                type: Sequelize.INTEGER,
                references: { model: 'freights', key: 'id' },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            registration_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            city: {
                type: Sequelize.STRING,
                allowNull: true
            },
            type_establishment: {
                type: Sequelize.STRING,
                allowNull: true
            },
            name_establishment: {
                type: Sequelize.STRING,
                allowNull: true
            },
            expense_description: {
                type: Sequelize.STRING,
                allowNull: true
            },
            dfe: {
                type: Sequelize.STRING,
                allowNull: true
            },
            value: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            img_receipt: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            payment: {
                type: Sequelize.JSONB,
                allowNull: false,
                defaultValue: {
                    modo: '',
                    value: 0,
                    parcels: 0,
                    flag: ''
                },
                validate: {
                    notEmpty: true
                }
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('travel_expenses');
    }
};
