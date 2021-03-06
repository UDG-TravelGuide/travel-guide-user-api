import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
// MODELS
import { RouteModel } from './Route';

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
            latitudeOrigin: {
                type: INTEGER,
                allowNull: false
            },
            longitudeOrigin: {
                type: INTEGER,
                allowNull: false
            },
            latitudeDestiny: {
                type: INTEGER,
                allowNull: false
            },
            longitudeDestiny: {
                type: INTEGER,
                allowNull: false
            },
            routeId: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: RouteModel,
                    key: 'id'
                }
            }
        });
    } else {
        directionModel = null;
    }
    return directionModel;
}

export const DirectionModel = getDirection();