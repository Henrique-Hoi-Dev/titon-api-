import Sequelize, { Model } from 'sequelize';

class States extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                uf: Sequelize.STRING
            },
            {
                sequelize,
                timestamps: true
            }
        );
        return this;
    }

    static associate(models) {
        this.hasMany(models.Cities, { foreignKey: 'states_id', as: 'cities' });
    }
}

export default States;
