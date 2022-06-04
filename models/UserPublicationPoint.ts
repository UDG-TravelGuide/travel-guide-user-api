import { UserModel } from './User';
import { PublicationModel } from './Publication';
import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';

const sequelize: Sequelize = getSequelize();

const getUserPublicationPoint = () => {
    let userPublicationPoint: ModelCtor<Model<any, any>>;
    if (sequelize) {
        userPublicationPoint = sequelize.define('UserPublicationPoint', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            publicationId: {
                type: INTEGER,
                references: {
                    model: PublicationModel,
                    key: 'id'
                }
            },
            userId: {
                type: INTEGER,
                references: {
                    model: UserModel,
                    key: 'id'
                }
            }
        });
    } else {
        userPublicationPoint = null;
    }
    return userPublicationPoint;
}

export const UserPublicationPointModel = getUserPublicationPoint();