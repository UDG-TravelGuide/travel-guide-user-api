import { Router } from "express";
import { loginUserGoogle } from '../controllers/AuthController';

export const AuthRouter: Router = Router();

AuthRouter.post('/google', [

], loginUserGoogle);