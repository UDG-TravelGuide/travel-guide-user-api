import { Sequelize, STRING, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';

const sequelize: Sequelize = getSequelize();

const getUser = () => {
    let userModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        userModel = sequelize.define('User', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userName: {
                type: STRING,
                allowNull: false
            },
            email: {
                type: STRING,
                allowNull: false
            },
            password: {
                type: STRING,
                allowNull: false
            },
            birthDate: {
                type: STRING,
                allowNull: true
            },
            profilePhoto: {
                type: STRING,
                allowNull: true
            },
            points: {
                type: INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            role: {
                type: STRING,
                allowNull: true,
                defaultValue: 'USER'
            }
        });
    } else {
        userModel = null;
    }
    return userModel;
}

export const UserModel = getUser();