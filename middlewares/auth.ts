import { response, request } from 'express';
import { verify } from 'jsonwebtoken';

export const verifyToken = ( req = request, res = response, next ) => {
    const bearerHeader: string = req.body.token || req.query.token || req.headers["authorization"];


    if (!bearerHeader) {
        return res.status(403).send("És necessari loguejar-se per realitzar aquestes operacions");
    }

    let token = '';

    if (bearerHeader.includes('Bearer')) {
        const bearer = bearerHeader.split(' ');
        token = bearer[1];
    } else {
        token = bearerHeader;
    }
    
    try {
        const decoded = verify(token, process.env.TOKEN_SECRET);
        if (!decoded) {
            return res.status(403).send("El token ha caducat");
        }
    } catch (err) {
        return res.status(401).send("Aquest token és invalid");
    }
    return next();
}