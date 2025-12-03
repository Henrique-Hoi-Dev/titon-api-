module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('freights', 'taxa_adm', {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Taxa de administração em centavos'
            }),
            queryInterface.addColumn('freights', 'insurance', {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Taxa de seguro em centavos'
            }),
            queryInterface.addColumn('freights', 'break_ton', {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Quebra, peso que foi perdido na viagem'
            })
        ]);
    },

    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn('freights', 'taxa_adm'),
            queryInterface.removeColumn('freights', 'insurance'),
            queryInterface.removeColumn('freights', 'break_ton')
        ]);
    }
};

