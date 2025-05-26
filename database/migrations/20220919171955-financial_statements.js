module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('financial_statements', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            creator_user_id: {
                type: Sequelize.INTEGER,
                references: { model: 'users', key: 'id' },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            driver_id: {
                type: Sequelize.INTEGER,
                references: { model: 'drivers', key: 'id' },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            truck_id: {
                type: Sequelize.INTEGER,
                references: { model: 'trucks', key: 'id' },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            cart_id: {
                type: Sequelize.INTEGER,
                references: { model: 'carts', key: 'id' },
                allowNull: true,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            percentage_commission: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            fixed_commission: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            daily: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            start_km: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            final_km: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            final_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            driver_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            truck_models: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            truck_board: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            truck_avatar: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            cart_models: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            cart_board: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            invoicing_all: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            transactions: {
                type: Sequelize.ARRAY({
                    type: Sequelize.JSONB,
                    defaultValue: {
                        typeTransactions: Sequelize.STRING,
                        value: Sequelize.INTEGER,
                    },
                }),
                defaultValue: [],
            },
            medium_fuel_all: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            total_value: {
                type: Sequelize.INTEGER,
                allowNull: true,
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
        return queryInterface.dropTable('financial_statements');
    },
};
