import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';

const sequelize: Sequelize = getSequelize();

const getDirection = () => {
    let directionModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        directionModel = sequelize.define('Direction', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            coordinateOrigin: {
                type: INTEGER,
                allowNull: false
            },
            coordinateDestiny: {
                type: INTEGER,
                allowNull: false
            }
        });
    } else {
        directionModel = null;
    }
    return directionModel;
}

export const DirectionModel = getDirection();