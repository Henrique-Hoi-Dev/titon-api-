module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('financial_statements', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            creator_user_id: {
                type: Sequelize.INTEGER,
                references: { model: 'users', key: 'id' },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            driver_id: {
                type: Sequelize.INTEGER,
                references: { model: 'drivers', key: 'id' },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            truck_id: {
                type: Sequelize.INTEGER,
                references: { model: 'trucks', key: 'id' },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            cart_id: {
                type: Sequelize.INTEGER,
                references: { model: 'carts', key: 'id' },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            status: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            start_km: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            end_km: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            total_invoicing: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            average_fuel_consumption: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            total_amount: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0
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
        return queryInterface.dropTable('financial_statements');
    }
};
