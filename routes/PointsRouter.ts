import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { addPointToPublication, removePointToPublication } from "../controllers/PointsController";

export const PointsRouter: Router = Router();

PointsRouter.patch('/add/:publicationId', [
    verifyToken
], addPointToPublication);

PointsRouter.patch('/remove/:publicationId', [
    verifyToken
], removePointToPublication);
