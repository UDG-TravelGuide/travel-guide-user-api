import { Router } from "express";
import { loginUserGoogle, recoverPassword } from '../controllers/AuthController';

export const AuthRouter: Router = Router();

AuthRouter.post('/google', [

], loginUserGoogle);

AuthRouter.post('/recoverPassword', [
    
], recoverPassword);