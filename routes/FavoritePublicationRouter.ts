import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { 
    addFavoritePublication,
    getFavoritePublicationsOfUser,
    removeFavoritePublication
} from "../controllers/FavoritePublicationController";

export const FavoritePublicationRouter: Router = Router();

FavoritePublicationRouter.get('/', [
    verifyToken
], getFavoritePublicationsOfUser);

FavoritePublicationRouter.patch('/add/:publicationId', [
    verifyToken
], addFavoritePublication);

FavoritePublicationRouter.patch('/remove/:publicationId', [
    verifyToken
], removeFavoritePublication);