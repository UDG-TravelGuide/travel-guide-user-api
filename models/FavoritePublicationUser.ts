import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
// Models
import { PublicationModel } from './Publication';
import { UserModel } from './User';

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
                allowNull: false,
                references: {
                    model: PublicationModel,
                    key: 'id'
                }
            },
            userId: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: UserModel,
                    key: 'id'
                }
            }
        });
    } else {
        favoritePublicationUser = null;
    }
    return favoritePublicationUser;
}

export const FavoritePublicationUserModel = getFavoritePublicationUser();