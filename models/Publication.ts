import { Sequelize, STRING, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';

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
            authorId: {
                type: INTEGER,
                allowNull: false
            },
            countryAlphaCode: {
                type: STRING,
                allowNull: false
            }
        });
    } else {
        publicationModel = null;
    }
    return publicationModel;
}

export const PublicationModel = getPublication();