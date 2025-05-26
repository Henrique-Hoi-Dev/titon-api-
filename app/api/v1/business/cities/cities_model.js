import Sequelize, { Model } from 'sequelize';

class Cities extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                states_id: Sequelize.INTEGER
            },
            {
                sequelize,
                timestamps: true
            }
        );
        return this;
    }

    static associate(models) {
        this.belongsTo(models.States, { foreignKey: 'states_id', as: 'states' });
    }
}

export default Cities;
