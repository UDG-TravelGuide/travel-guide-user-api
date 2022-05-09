import { Sequelize } from "sequelize";

const sequelize: Sequelize = new Sequelize( process.env.DATABASE_URI , {
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