import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
// Models
import { PublicationModel } from './Publication';

const sequelize: Sequelize = getSequelize();

const getRoute = () => {
    let routeModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        routeModel = sequelize.define('Route', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            latitudeInital: {
                type: INTEGER,
                allowNull: false
            },
            longitudeInital: {
                type: INTEGER,
                allowNull: false
            },
            latitudeFinal: {
                type: INTEGER,
                allowNull: false
            },
            longitudeFinal: {
                type: INTEGER,
                allowNull: false
            },
            publicationId: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: PublicationModel,
                    key: 'id'
                }
            }
        });
    } else {
        routeModel = null;
    }
    return routeModel;
}

export const RouteModel = getRoute();