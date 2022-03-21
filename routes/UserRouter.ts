import { Router } from "express";
import { check } from 'express-validator';
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
    verifyToken,
    check('email').isEmail().withMessage('El correu electrònic té un format incorrecte'),
    check('userName').not().isEmpty(),
    check('password').not().isEmpty(),
    check('birthDate').not().isEmpty()
], createUser);

UserRouter.post('/login', [
    check('email').isEmail().withMessage('El correu electrònic té un format incorrecte'),
    check('password').not().isEmpty()
], loginUser);

UserRouter.put('/edit/:id', [
    verifyToken,
    check('userName').not().isEmpty(),
    check('password').not().isEmpty(),
    check('birthDate').isDate({ format: 'DD-MM-YYYY' })
], editUser);

UserRouter.delete('/delete/:id', [
    verifyToken
], deleteUser);