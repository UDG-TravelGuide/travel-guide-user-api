import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
import { ContentDirectionModel } from './ContentDirection';
// Model
import { CoordinateModel } from './Coordinate';

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
                allowNull: false,
                references: {
                    model: CoordinateModel,
                    key: 'id'
                }
            },
            coordinateDestiny: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: CoordinateModel,
                    key: 'id'
                }
            }
        });
        directionModel.hasMany(CoordinateModel, {
            onDelete: 'CASCADE'
        });
        directionModel.belongsToMany(CoordinateModel, { 
            through: ContentDirectionModel,
            onDelete: 'CASCADE'
        });
    } else {
        directionModel = null;
    }
    return directionModel;
}

export const DirectionModel = getDirection();