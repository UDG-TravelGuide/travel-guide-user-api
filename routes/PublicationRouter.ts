import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { 
    createPublication,
    getPublication, 
    getPublications,
    getPublicationsByCountry
} from "../controllers/PublicationController";


export const PublicationRouter: Router = Router();

PublicationRouter.get('/', [
    verifyToken
], getPublications);

PublicationRouter.get('/:id', [
    verifyToken
], getPublication);

PublicationRouter.get('/byCountry/:country', [
    verifyToken
], getPublicationsByCountry);

PublicationRouter.post('/new', [
    verifyToken
], createPublication);
