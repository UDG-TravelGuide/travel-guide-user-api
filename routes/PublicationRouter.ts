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
    deletePublicationBo,
    reportPublication,
    getAllPublications
} from "../controllers/PublicationController";


export const PublicationRouter: Router = Router();

PublicationRouter.get('/', [
], getPublications);

PublicationRouter.get('/all', [
], getAllPublications);

PublicationRouter.get('/backoffice', [
    authorizeAdmin
], getPublicationsForBo);

PublicationRouter.get('/:id', [
], getPublication);

PublicationRouter.get('/byCountry/:country', [
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

PublicationRouter.patch('/report/:publicationId', [
    verifyToken
], reportPublication);

PublicationRouter.delete('/delete/:publicationId', [
    verifyToken
], deletePublication);

PublicationRouter.delete('/deleteBo/:publicationId', [
    authorizeAdmin
], deletePublicationBo);