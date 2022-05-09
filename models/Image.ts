import { Sequelize, STRING, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';

const sequelize: Sequelize = getSequelize();

const getImage = () => {
    let imageModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        imageModel = sequelize.define('Image', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            value: {
                type: STRING,
                allowNull: false
            },
            contentId: {
                type: INTEGER,
                allowNull: false
            }
        });
    } else {
        imageModel = null;
    }
    return imageModel;
}

export const ImageModel = getImage();