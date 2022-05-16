import { Sequelize, STRING, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
// Models
import { PublicationModel } from './Publication';
import { DirectionModel } from './Direction';
import { ContentDirectionModel } from './ContentDirection';

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
                allowNull: false
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
        contentModel.belongsTo(PublicationModel);
        contentModel.belongsToMany(DirectionModel, { 
            through: ContentDirectionModel,
            onDelete: 'CASCADE'
        });
    } else {
        contentModel = null;
    }
    return contentModel;
}

export const ContentModel = getContent();