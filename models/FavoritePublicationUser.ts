import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';

const sequelize: Sequelize = getSequelize();

const getFavoritePublicationUser = () => {
    let favoritePublicationUser: ModelCtor<Model<any, any>>;
    if (sequelize) {
        favoritePublicationUser = sequelize.define('FavoritePublicationUser', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            publicationId: {
                type: INTEGER,
                allowNull: false
            },
            userId: {
                type: INTEGER,
                allowNull: false
            }
        });
    } else {
        favoritePublicationUser = null;
    }
    return favoritePublicationUser;
}

export const FavoritePublicationUserModel = getFavoritePublicationUser();