import express from 'express';    
import cors from 'cors';
import dotenv from 'dotenv';

import { Paths } from './../config/paths';
import { UserRouter } from '../routes/UserRouter';

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
        this._app.use( express.json() );

        // Directori public
        this._app.use( express.static('public') );
    }

    private _initRoutes(): void {
        this._app.get('/', (_, res) => {
            res.status(200).json({
                message: `API funcionant correctament`
            });
        });

        this._app.use( Paths.UsersPath, UserRouter );
    }
}