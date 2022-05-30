import { response, request } from 'express';
import { JwtPayload, decode, verify, sign } from 'jsonwebtoken';

export const verifyToken = ( req = request, res = response, next ) => {
    const bearerHeader: string = req.body?.token || req.query?.token || req.headers["authorization"];


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
        const decoded: string | JwtPayload = decode(token);
        if ((typeof decoded !== "string") && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({
                message: "El token ha caducat"
            });
        }

        const verified = verify(token, process.env.TOKEN_SECRET);
        if (!verified) {
            return res.status(401).json({
                message: "Aquest token és invalid"
            });
        }

        const signed = sign(token, process.env.TOKEN_SECRET);
        if (!signed) {
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