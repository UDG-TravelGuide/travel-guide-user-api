import { Sequelize, INTEGER, Model, ModelCtor } from 'sequelize';
import { getSequelize } from '../config/dbConfig';
// Models
import { ContentModel } from './Content';
import { DirectionModel } from './Direction';

const sequelize: Sequelize = getSequelize();

const getContentDirection = () => {
    let contentDirectionModel: ModelCtor<Model<any, any>>;
    if (sequelize) {
        contentDirectionModel = sequelize.define('ContentDirection', {
            id: {
                type: INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            contentId: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: ContentModel,
                    key: 'id'
                }
            },
            directionId: {
                type: INTEGER,
                allowNull: false,
                references: {
                    model: DirectionModel,
                    key: 'id'
                }
            }
        });
    } else {
        contentDirectionModel = null;
    }
    return contentDirectionModel;
}

export const ContentDirectionModel = getContentDirection();