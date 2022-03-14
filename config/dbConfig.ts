import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize: Sequelize = new Sequelize( 'postgres://ynwcapgdzxydic:8d2a170e98176ec1163e55368ab96e8d1c94032f6fbb89fe6401b61819fdcd06@ec2-52-209-185-5.eu-west-1.compute.amazonaws.com:5432/d60798l516ib5g', {
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    define: {
        timestamps: false,
        underscored: true
    }
});

export const getSequelize = () => {
    return (sequelize != null && sequelize != undefined) ? sequelize : null;
}