import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { addPointToPublication, removePointToPublication, userHasGivenPointsToPublication } from "../controllers/PointsController";

export const PointsRouter: Router = Router();

PointsRouter.get('/pointsTo/:publicationId',[
    verifyToken
], userHasGivenPointsToPublication);

PointsRouter.patch('/add/:publicationId', [
    verifyToken
], addPointToPublication);

PointsRouter.patch('/remove/:publicationId', [
    verifyToken
], removePointToPublication);
