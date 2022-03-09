import { Router } from "express";
import { check } from 'express-validator'; // TODO: Afegir validadors
import { 
    getUsers, 
    getUser,
    createUser,
    editUser,
    deleteUser
} from "../controllers/UserController";

export const UserRouter: Router = Router();

UserRouter.get('/', getUsers);

UserRouter.get('/:id', getUser);

UserRouter.post('/new', createUser);

UserRouter.put('/edit/:id', editUser);

UserRouter.delete('/delete/:id', deleteUser);