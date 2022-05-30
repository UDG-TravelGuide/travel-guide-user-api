import { Sequelize, STRING, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
// Models
import { UserModel } from './User';

const sequelize: Sequelize = getSequelize();

const getPublication = () => {
    let publicationModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        publicationModel = sequelize.define('Publication', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            title: {
                type: STRING,
                allowNull: false
            },
            description: {
                type: STRING,
                allowNull: false
            },
            countryAlphaCode: {
                type: STRING,
                allowNull: false
            },
            numberOfReports: {
                type: INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            points: {
                type: INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            authorId: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: UserModel,
                    key: 'id'
                }
            }
        });
    } else {
        publicationModel = null;
    }
    return publicationModel;
}

export const PublicationModel = getPublication();