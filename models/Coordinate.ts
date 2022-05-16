import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
// Model
import { DirectionModel } from './Direction';

const sequelize: Sequelize = getSequelize();

const getCoordinate = () => {
    let coordinateModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        coordinateModel = sequelize.define('Coordinate', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            latitude: {
                type: INTEGER,
                allowNull: false
            },
            longitude: {
                type: INTEGER,
                allowNull: false
            }
        });
        coordinateModel.belongsTo(DirectionModel, {
            onDelete: 'CASCADE'
        });
    } else {
        coordinateModel = null;
    }
    return coordinateModel;
}

export const CoordinateModel = getCoordinate();