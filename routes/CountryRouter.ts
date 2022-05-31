import { Router } from "express";
import { verifyToken } from '../middlewares/auth';
import { getAllCountries } from "../controllers/CountryController";

export const CountryRouter: Router = Router();

CountryRouter.get('/', [
    verifyToken
], getAllCountries);