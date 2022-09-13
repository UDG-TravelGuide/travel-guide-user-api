import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ROUTES
import { Paths } from './../config/paths';
import { UserRouter } from '../routes/UserRouter';
import { PublicationRouter } from '../routes/PublicationRouter';
import { FavoritePublicationRouter } from '../routes/FavoritePublicationRouter';
import { CountryRouter } from '../routes/CountryRouter';
import { PointsRouter } from './../routes/PointsRouter';
import { AuthRouter } from './../routes/AuthRouter';
// MODELS
import { ImageModel } from './Image';
import { UserModel } from './User';
import { PublicationModel } from './Publication';
import { DirectionModel } from './Direction';
import { ContentModel } from './Content';
import { RouteModel } from './Route';
import { FavoritePublicationUserModel } from './FavoritePublicationUser';
import { UserPublicationPointModel } from './UserPublicationPoint';

export class Server {
    private _app: express.Application;
    private _port: number;

    constructor() {
        // Carrega de variables d'enviroment
        dotenv.config();

        // Configuració del servidor
        this._app = express();
        this._port = Number( process.env.PORT || '5000' );

        // Middlewares
        this._initMiddlewares();

        // Configuració de les rutes
        this._initRoutes();

        // Init DB relationships
        this._initDbRelations();
    }

    public listen(): void {
        this._app.listen(this._port, () => {
            console.log(`El servidor s'esta executant satisfactoriament en el port: ${ this._port }`);
        });
    }

    private _initMiddlewares(): void {
        // CORS
        this._app.use( cors() );

        // Configura el parser JSON per lectura i escriptura
        this._app.use( express.json({ limit: '100mb' }) );

        // Directori public
        this._app.use( express.static('public') );

        // Limit de mida d'imatge
        this._app.use( express.urlencoded({ limit: '100mb', extended: true }) );
    }

    private _initRoutes(): void {
        this._app.get('/', (_, res) => {
            res.status(200).json({
                message: `API funcionant correctament`
            });
        });

        this._app.use( Paths.UsersPath, UserRouter );
        this._app.use( Paths.PublicationsPath, PublicationRouter );
        this._app.use( Paths.FavoritesPath, FavoritePublicationRouter );
        this._app.use( Paths.CountriesPath, CountryRouter );
        this._app.use( Paths.PointsPath, PointsRouter );
        this._app.use( Paths.AuthPath,  AuthRouter );
    }

    private _initDbRelations(): void {
        ContentModel.belongsTo(PublicationModel, { foreignKey: 'publicationId', onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
        PublicationModel.belongsTo(UserModel, { foreignKey: 'authorId', onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
        RouteModel.belongsTo(PublicationModel, { foreignKey: 'publicationId', onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
        DirectionModel.belongsTo(RouteModel, { foreignKey: 'routeId', onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
        ImageModel.belongsTo(ContentModel, { foreignKey: 'contentId', onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
        PublicationModel.belongsToMany(UserModel, { through: FavoritePublicationUserModel, onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
        UserModel.belongsToMany(PublicationModel, { through: FavoritePublicationUserModel, onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
        PublicationModel.belongsToMany(UserModel, { through: UserPublicationPointModel, onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
        UserModel.belongsToMany(PublicationModel, { through: UserPublicationPointModel, onDelete: 'CASCADE', onUpdate: 'CASCADE', hooks: true });
    }
}