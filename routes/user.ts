import { Router } from "express";
import { check } from 'express-validator'; // TODO: Afegir validadors
import { verifyToken } from '../middlewares/auth';
import { 
    getUsers, 
    getUser,
    createUser,
    editUser,
    deleteUser,
    loginUser
} from "../controllers/UserController";

export const UserRouter: Router = Router();

UserRouter.get('/', [
    verifyToken
], getUsers);

UserRouter.get('/:id', [
    verifyToken
], getUser);

UserRouter.post('/new', [
    verifyToken
], createUser);

UserRouter.post('/login', loginUser);

UserRouter.put('/edit/:id', [
    verifyToken
], editUser);

UserRouter.delete('/delete/:id', [
    verifyToken
], deleteUser);