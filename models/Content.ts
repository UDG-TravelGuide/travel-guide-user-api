import { Sequelize, STRING, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';

const sequelize: Sequelize = getSequelize();

const getContent = () => {
    let contentModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        contentModel = sequelize.define('Content', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            type: {
                type: STRING,
                allowNull: false
            },
            value: {
                type: STRING,
                allowNull: true
            },
            position: {
                type: INTEGER,
                allowNull: false
            },
            publicationId: {
                type: INTEGER,
                allowNull: false
            }
        });
    } else {
        contentModel = null;
    }
    return contentModel;
}

export const ContentModel = getContent();