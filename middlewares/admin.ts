import { response, request } from 'express';
import { verify } from 'jsonwebtoken';

export const authorizeAdmin = ( req = request, res = response, next ) => {
    const bearerHeader: string = req.body?.token || req.query?.token || req.headers["authorization"];
    const mainRole = 'ADMIN';

    if (!bearerHeader) {
        return res.status(401).json({
            message: "És necessari loguejar-se per realitzar aquestes operacions"
        });
    }

    let token = '';

    if (bearerHeader.includes('Bearer')) {
        const bearer = bearerHeader.split(' ');
        token = bearer[1];
    } else {
        token = bearerHeader;
    }
    
    try {
        const verified = verify(token, process.env.TOKEN_SECRET);
        if (!verified) {
            return res.status(401).json({
                message: "Aquest token és invalid"
            });
        }

        if (typeof verified !== 'string') {
            const user = verified;
            if (user.role != mainRole) {
                return res.status(401).json({
                    message: "Aquest usuari no te els permisos per realitzar aquesta acció"
                });
            }
        } else {
            return res.status(401).json({
                message: "Aquest token és invalid"
            });
        }
    } catch (err) {
        return res.status(401).json({
            message: "Aquest token és invalid"
        });
    }
    return next();
}