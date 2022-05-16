import { Sequelize, STRING, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
// Models
import { ContentModel } from './Content';
import { UserModel } from './User';
import { FavoritePublicationUserModel } from './FavoritePublicationUser';

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
                allowNull: false,
                references: {
                    model: UserModel,
                    key: 'id'
                }
            },
            countryAlphaCode: {
                type: STRING,
                allowNull: false
            }
        });
        publicationModel.hasMany(ContentModel, {
            onDelete: 'CASCADE'
        });
        publicationModel.belongsTo(UserModel);
        publicationModel.belongsToMany(UserModel, { through: FavoritePublicationUserModel })
    } else {
        publicationModel = null;
    }
    return publicationModel;
}

export const PublicationModel = getPublication();