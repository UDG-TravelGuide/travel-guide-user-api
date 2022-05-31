// Imports
import { response, request } from 'express';

export const getAllCountries = async( _ = request, res = response ): Promise<void> => {
    try {
        fetch(`https://restcountries.com/v3.1/all`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            res.status(200).json(response);
        }).catch(err => {
            console.error(err);
            res.status(401).json({
                message: `Ha sorgit un error al intentar obtenir les els paisos.`
            });
        });;
    } catch (error) {
        console.error(err);
        res.status(401).json({
            message: `Ha sorgit un error al intentar obtenir les els paisos.`
        });
    }
}