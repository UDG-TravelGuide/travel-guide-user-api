import { Sequelize, STRING, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
import { UserModel } from './User';

const sequelize: Sequelize = getSequelize();

const getRecover = () => {
    let recoverModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        recoverModel = sequelize.define('Recover', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: INTEGER,
                references: {
                    model: UserModel,
                    key: 'id'
                }
            },
            token: {
                type: STRING,
                allowNull: false
            },
            used: {
                type: INTEGER,
                allowNull: false,
                defaultValue: 0
            }
        });
    } else {
        recoverModel = null;
    }
    return recoverModel;
}

export const RecoverModel = getRecover();