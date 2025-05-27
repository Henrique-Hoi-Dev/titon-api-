module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('data_drivers', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            driver_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            truck_models: {
                type: Sequelize.STRING,
                allowNull: false
            },
            cart_models: {
                type: Sequelize.STRING,
                allowNull: false
            },
            credit: {
                type: Sequelize.DOUBLE,
                allowNull: false
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
        return queryInterface.dropTable('data_drivers');
    }
};
