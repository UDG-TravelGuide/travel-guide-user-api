import { Router } from "express";
import { getAllCountries } from "../controllers/CountryController";

export const CountryRouter: Router = Router();

CountryRouter.get('/', [], getAllCountries);