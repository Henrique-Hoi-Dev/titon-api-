module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('credits', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            driver_id: {
                type: Sequelize.INTEGER,
                references: { model: 'drivers', key: 'id' },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            financial_statements_id: {
                type: Sequelize.INTEGER,
                references: { model: 'financial_statements', key: 'id' },
                allowNull: false,
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
            value: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false
            },
            type_method: Sequelize.ENUM({
                values: ['DEBIT', 'CREDIT']
            }),
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
        return queryInterface.dropTable('credits');
    }
};
