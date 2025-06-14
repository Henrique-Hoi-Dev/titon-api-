module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('freights', {
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
            start_freight_city: {
                type: Sequelize.STRING
            },
            end_freight_city: {
                type: Sequelize.STRING
            },
            truck_location: {
                type: Sequelize.STRING
            },
            contractor_name: {
                type: Sequelize.STRING
            },
            truck_current_km: {
                type: Sequelize.INTEGER
            },
            fuel_avg_per_km: {
                type: Sequelize.INTEGER
            },
            estimated_tonnage: {
                type: Sequelize.INTEGER
            },
            estimated_fuel_cost: {
                type: Sequelize.INTEGER
            },
            ton_value: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.ENUM,
                values: ['PENDING', 'APPROVED', 'STARTING_TRIP', 'DENIED', 'FINISHED']
            },
            route_distance_km: {
                type: Sequelize.STRING
            },
            route_duration: {
                type: Sequelize.STRING
            },

            // level two
            tons_loaded: {
                type: Sequelize.INTEGER
            },
            toll_cost: {
                type: Sequelize.INTEGER
            },
            truck_km_end_trip: {
                type: Sequelize.INTEGER
            },
            discharge: {
                type: Sequelize.INTEGER
            },

            // proof
            img_proof_cte: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            img_proof_ticket: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            img_proof_freight_letter: {
                type: Sequelize.JSONB,
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
        return queryInterface.dropTable('freights');
    }
};
