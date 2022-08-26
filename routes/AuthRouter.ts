import { Router } from "express";
import { 
    loginUserGoogle, 
    recoverPassword,
    newPassword 
} from '../controllers/AuthController';

export const AuthRouter: Router = Router();

AuthRouter.post('/google', [

], loginUserGoogle);

AuthRouter.post('/recoverPassword', [
    
], recoverPassword);

AuthRouter.post('/newPassword', [

], newPassword);