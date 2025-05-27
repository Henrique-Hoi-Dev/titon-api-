module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('carts', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            cart_models: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cart_brand: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cart_tara: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cart_color: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cart_bodyworks: {
                type: Sequelize.ENUM,
                values: ['tank', 'bulkCarrier', 'sider', 'chest', 'bucket'],
                defaultValue: null
            },
            cart_year: {
                type: Sequelize.STRING,
                allowNull: true
            },
            cart_chassis: {
                type: Sequelize.DOUBLE,
                allowNull: true
            },
            cart_liter_capacity: {
                type: Sequelize.DOUBLE,
                allowNull: true
            },
            cart_ton_capacity: {
                type: Sequelize.DOUBLE,
                allowNull: true
            },
            cart_board: {
                type: Sequelize.STRING,
                allowNull: true
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
        return queryInterface.dropTable('carts');
    }
};
