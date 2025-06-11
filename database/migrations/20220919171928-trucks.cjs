module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('trucks', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            truck_models: {
                type: Sequelize.STRING,
                allowNull: false
            },
            truck_name_brand: {
                type: Sequelize.STRING,
                allowNull: false
            },
            truck_board: {
                type: Sequelize.STRING,
                allowNull: false
            },
            truck_color: {
                type: Sequelize.STRING,
                allowNull: false
            },
            truck_km: {
                type: Sequelize.DOUBLE,
                allowNull: true
            },
            truck_chassis: {
                type: Sequelize.STRING,
                allowNull: true
            },
            truck_year: {
                type: Sequelize.STRING,
                allowNull: true
            },
            image_truck: {
                type: Sequelize.JSONB,
                allowNull: true,
                defaultValue: {}
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
        return queryInterface.dropTable('trucks');
    }
};
