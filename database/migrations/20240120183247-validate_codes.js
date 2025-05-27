module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('validate_codes', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            cpf: {
                type: Sequelize.STRING,
                allowNull: false
            },
            expiration_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            status: {
                type: Sequelize.ENUM({
                    values: ['AVAILABLE', 'EXPIRED', 'USED']
                }),
                defaultValue: 'AVAILABLE'
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
        return queryInterface.dropTable('validate_codes');
    }
};
