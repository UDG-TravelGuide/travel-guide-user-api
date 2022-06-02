import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { authorizeAdmin } from "../middlewares/admin";
import { 
    createPublication,
    getPublication, 
    getPublications,
    getPublicationsByCountry,
    getPublicationsByAuthor,
    deletePublication,
    getPublicationsForBo,
    editPublication,
    deletePublicationBo
} from "../controllers/PublicationController";


export const PublicationRouter: Router = Router();

PublicationRouter.get('/', [
    verifyToken
], getPublications);

PublicationRouter.get('/backoffice', [
    authorizeAdmin
], getPublicationsForBo);

PublicationRouter.get('/:id', [
    verifyToken
], getPublication);

PublicationRouter.get('/byCountry/:country', [
    verifyToken
], getPublicationsByCountry);

PublicationRouter.get('/byAuthor/:authorId', [
    verifyToken
], getPublicationsByAuthor);

PublicationRouter.post('/new', [
    verifyToken
], createPublication);

PublicationRouter.put('/edit/:id', [
    verifyToken
], editPublication);

PublicationRouter.delete('/delete/:publicationId', [
    verifyToken
], deletePublication);

PublicationRouter.delete('/deleteBo/:publicationId', [
    authorizeAdmin
], deletePublicationBo);