import { response, request } from 'express';
import { hash, genSalt, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken';
// Interfaces
import { UserCreate, UserEdit, UserLogin } from '../interfaces/UserInterfaces';
import { JWTUser } from '../interfaces/JWTUser';
// Models
import { UserModel } from '../models/User';
// Helpers
import { getPageAndLimit } from '../helpers/Paginate';
import { LOGGER } from '../helpers/Logger';

export const getUsers = async( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `getUsers@UserController -`;
    LOGGER.info(`${ LOGGER_BASE } init`);

    const params = req.params;

    try {
        const { limit, offset } : { limit: number; offset: number; } = getPageAndLimit(params);

        const users = await UserModel.findAndCountAll({
            limit: limit,
            offset: offset
        });

        const num: number = Math.abs(users.count / 10);
        const numPages: number = num > 0 ? num : 1;

        if (users.rows instanceof Array && users.rows.length > 0) {
            res.json({
                users: users.rows,
                page: offset,
                pages: numPages
            });
            LOGGER.info(`${ LOGGER_BASE } users returned`);
        } else {
            res.json( [] );
            LOGGER.warn(`${ LOGGER_BASE } users not found`);
        }
    } catch (error) {
        LOGGER.error(`${ LOGGER_BASE } error obtaining users - Error: ${ error }`);
        res.status(500).json({
            message: 'Error al obtenir els usuaris'
        });
    }
}

export const getUser = async( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `getUser@UserController -`;
    LOGGER.info(`${ LOGGER_BASE } init`);

    const params = req.params;
    
    try {
        const user: any = await UserModel.findOne({ where: { id: params.id } });
        if (user instanceof UserModel && user != null) {

            const returnUser = {
                id: user.id,
                userName: user.userName,
                email: user.email,
                birthDate: user.birthDate,
                profilePhoto: user.profilePhoto,
                points: user.points
            };

            res.json( returnUser );

            LOGGER.info(`${ LOGGER_BASE } user returned`);

        } else {

            res.status(400).json({
                message: `No s'ha trobat el usuari amb id: ${ params.id }`
            });

            LOGGER.warn(`${ LOGGER_BASE } not found user with id: ${ params.id }`);
            
        }
    } catch (error) {
        res.status(500).json({
            message: `Error al obtenir l'usuari amb id: ${ params.id }`
        });

        LOGGER.error(`${ LOGGER_BASE } error obtaining user with id: ${ params.id } - Error: ${ error }`);
    }
}

export const getCurrentUserByToken = async( req = request, _ = response ): Promise<JWTUser> => {
    let token = '';
    const bearerHeader: string = req.body?.token || req.query?.token || req.headers["authorization"];

    if (bearerHeader.includes('Bearer')) {
        const bearer = bearerHeader.split(' ');
        token = bearer[1];
    } else {
        token = bearerHeader;
    }

    try {
        let splitToken = token.split('.');
        let toPayload = splitToken[1];
        const payload = atob(toPayload);
        const user: JWTUser = JSON.parse(payload);
        return user;
    } catch (error) {
        return error;
    }
}

export const getCurrentUser = async( req = request, res = response ): Promise<void> => {
    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);
        const userBd: any = await UserModel.findOne({ where: { id: user.id } });
        res.json({
            id: user.id,
            userName: userBd.userName,
            email: userBd.email,
            birthDate: userBd.birthDate,
            profilePhoto: userBd.profilePhoto,
            points: userBd.points
        });
    } catch (error) {
        res.status(500).json({
            message: "S'ha produit un error al obtenir l'usuari actual"
        });
    }
}

export const getRefreshToken = async( req = request, res = response ): Promise<void> => {
    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);
        const getUser: any = await UserModel.findOne({ where: { id: user.id } });
        const refreshToken = sign({
            id: getUser.id,
            name: getUser.userName,
            role: getUser.role
        }, process.env.TOKEN_SECRET);

        res.status(200).json({
            token: refreshToken
        });
    } catch (error) {
        res.status(500).json({
            message: "S'ha produit un error al intentar comprovar el token"
        });
    }
}

export const createUser = async( req = request, res = response ): Promise<void> => {
    const body: UserCreate = req.body;
    
    try {
        const getUser = await UserModel.findOne({ where: { email: body.email } });

        if (getUser instanceof UserModel && getUser != null) {
            res.status(400).json({
                message: `Aquest correu electrònic ja està registrat`
            });
        } else {
            const salt = await genSalt(10);
            const hashedPassword = await hash(body.password, salt);
    
            const newUser = {
                userName: body.userName,
                email: body.email,
                password: hashedPassword,
                birthDate: body.birthDate
            };
    
            const user: any = await UserModel.create(newUser);
            user.save();

            const token = sign({
                name: user.userName,
                id: user.id
            }, process.env.TOKEN_SECRET);

            res.status(200).json({
                user: user,
                token: token
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error al crear l'usuari nou`
        });
    }
}

export const editUser = async( req = request, res = response ): Promise<void> => {
    const params: any = req.params;
    const body: UserEdit = req.body;

    const user: any = await UserModel.findOne({ where: { id: params.id } });

    if (user instanceof UserModel && user != null) {
        let editFields: UserEdit = {
            userName: body.userName,
            birthDate: body.birthDate,
            profilePhoto: body.profilePhoto
        };

        if (body.password != null) {
            const salt = await genSalt(10);
            const hashedPassword = await hash(body.password, salt);
            editFields.password = hashedPassword;
        }

        try {
            user.update( editFields, {
                where: { id: params.id }
            });
            user.save();
            res.status(200).json( user );
        } catch (error) {
            res.status(500).json({
                message: `Error al editar l'usuari amb id: ${ params.id }`
            });
        }
    } else {
        res.status(400).json({
            message: `No s'ha trobat el usuari amb id: ${ params.id }`
        });
    }
}

export const deleteUser = async ( req = request, res = response ): Promise<void> => {
    const params: any = req.params;

    UserModel.destroy({
        where: {
            id: params.id
        }
    }).then(_ => {
        res.status(200).json({
            message: `S'ha eliminat correctament l'usuari`
        });
    }).catch(error => {
        console.error(error);
        res.status(500).json({
            message: `Error al eliminar l'usuari amb id: ${ params.id }`
        });
    });
}

export const loginUser = async ( req = request, res = response ): Promise<void> => {
    const body: UserLogin = req.body;

    try {
        const user: any = await UserModel.findOne({ where: { email: body.email } });

        if (user instanceof UserModel && user != null) {
            if (user.blocked) {
                res.status(405).json({
                    message: `Aquest usuari no es pot loguejar degut a que està bloquejat`
                });
            } else {
                const validPassword: Boolean = await compare(body.password, user.password);
                if (validPassword) {
                    const token = sign({
                        name: user.userName,
                        id: user.id,
                        role: user.role
                    }, process.env.TOKEN_SECRET);
                    res.status(200).json( { token } );
                } else {
                    res.status(400).json({
                        message: `La contrasenya és incorrecta`
                    });
                }
            }
        } else {
            res.status(400).json({
                message: `No s'ha trobat el usuari amb el correu: ${ body.email }`
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error al realitzar el login`
        });
    }
}

export const blockUser = async ( req = request, res = response ): Promise<void> => {
    const params: any = req.params;

    UserModel.update(
        {
            blocked: true
        },
        { where: { id: params.id } }
    ).then(_ => {
        res.status(200).json({
            message: `S'ha bloquejat correctament l'usuari`
        });
    }).catch(error => {
        console.error(error);
        res.status(500).json({
            message: `Error al bloquejar l'usuari amb id: ${ params.id }`
        });
    });
}

export const unblockUser = async ( req = request, res = response ): Promise<void> => {
    const params: any = req.params;

    UserModel.update(
        {
            blocked: false
        },
        { where: { id: params.id } }
    ).then(_ => {
        res.status(200).json({
            message: `S'ha desbloquejat correctament l'usuari`
        });
    }).catch(error => {
        console.error(error);
        res.status(500).json({
            message: `Error al desbloquejar l'usuari amb id: ${ params.id }`
        });
    });
}

export const changeRole = async ( req = request, res = response ): Promise<void> => {
    const params: any = req.params;
    const body = req.body;

    UserModel.update(
        {
            role: body.role
        },
        { where: { id: params.id } }
    ).then(_ => {
        res.status(200).json({
            message: `S'ha canviar correctament el rol de l'usuari`
        });
    }).catch(error => {
        console.error(error);
        res.status(500).json({
            message: `Error al canviar el rol de l'usuari amb id: ${ params.id }`
        });
    });
}