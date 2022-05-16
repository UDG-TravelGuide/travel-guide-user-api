import { Router } from "express";
import { check } from 'express-validator';
import { verifyToken } from '../middlewares/auth';
import { 
    getUsers, 
    getUser,
    createUser,
    editUser,
    loginUser,
    getCurrentUser
} from "../controllers/UserController";

export const UserRouter: Router = Router();

UserRouter.get('/', [
    verifyToken
], getUsers);

UserRouter.get('/current', [
    verifyToken
], getCurrentUser);

UserRouter.get('/:id', [
    verifyToken
], getUser);

UserRouter.post('/new', [
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