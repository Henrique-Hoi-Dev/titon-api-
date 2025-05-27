module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('notifications', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            content: {
                type: Sequelize.STRING,
                allowNull: false
            },
            driver_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            freight_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            financial_statements_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                value: false
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
        return queryInterface.dropTable('notifications');
    }
};
