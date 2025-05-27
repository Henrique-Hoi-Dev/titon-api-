import Sequelize, { Model } from 'sequelize';

class Permission extends Model {
    static init(sequelize) {
        super.init(
            {
                role: Sequelize.STRING,
                actions: {
                    type: Sequelize.ARRAY(Sequelize.STRING)
                }
            },
            {
                sequelize,
                timestamps: true
            }
        );
        return this;
    }

    static associate(models) {
        this.hasMany(models.Users, { foreignKey: 'permission_id', as: 'users' });
    }
}

export default Permission;
