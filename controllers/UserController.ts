import { response, request } from 'express';
import { hash, genSalt, compare } from 'bcryptjs';
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
        res.status(500).json({
            message: {
                cat: 'Error al obtenir els usuaris',
                es: 'Error al obtener los usuarios',
                eng: 'Error getting users'
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error obtaining users - Error: ${ error }`);
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

            LOGGER.info(`${ LOGGER_BASE } returned user with id: '${ user.id }'`);

        } else {

            res.status(400).json({
                message: {
                    cat: `No s'ha trobat el usuari amb id: '${ params.id }'`,
                    es: `No se ha encontrado el usuario con id: '${ params.id }'`,
                    eng: `User with id: '${ params.id }'' not found`
                }
            });

            LOGGER.warn(`${ LOGGER_BASE } not found user with id: '${ params.id }'`);
            
        }
    } catch (error) {
        res.status(500).json({
            message: {
                cat: `Error al obtenir l'usuari amb id: '${ params.id }'`,
                es: `Error al obtener el usuario con id: '${ params.id }'`,
                eng: `Error getting user with id: '${ params.id }'`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error obtaining user with id: '${ params.id }' - Error: ${ error }`);
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

    let splitToken = token.split('.');
    let toPayload = splitToken[1];
    const payload = atob(toPayload);
    const user: JWTUser = JSON.parse(payload);
    return user;
}

export const getCurrentUser = async( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `getCurrentUser@UserController -`;
    
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
            message: {
                cat: `S'ha produit un error al obtenir l'usuari actual`,
                es: `Se ha producido un error al obtener el usuario actual`,
                eng: `An error occurred while getting the current user`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error obtaining user - Error: ${ error }`);
    }
}

export const getRefreshToken = async( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `getRefreshToken@UserController -`;

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
            message: {
                cat: `S'ha produit un error al intentar comprovar el token`,
                es: `Se ha producido un error al intentar comprobar el token`,
                eng: `An error occurred while trying to check the token'`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error getting refresh token - Error: ${ error }`);
    }
}

export const createUser = async( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `createUser@UserController -`;

    const body: UserCreate = req.body;
    
    try {
        const getUser = await UserModel.findOne({ where: { email: body.email } });

        if (getUser instanceof UserModel && getUser != null) {
            res.status(400).json({
                message: {
                    cat: `Aquest correu electrònic ja està registrat`,
                    es: `Este correo electrónico ya está registrado`,
                    eng: `This email is already registered`
                }
            });

            LOGGER.warn(`${ LOGGER_BASE } can't create user because this email exists in database: '${ body.email }'`);
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

            LOGGER.info(`${ LOGGER_BASE } created user with email: '${ body.email }'`);
        }
    } catch (error) {
        res.status(500).json({
            message: {
                cat: `Error al crear l'usuari nou`,
                es: `Error al crear el nuevo usuario`,
                eng: `Error creating new user`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error creating user - Error: ${ error } `)
    }
}

export const editUser = async( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `editUser@UserController -`;

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
            await user.save();
            res.status(200).json( user );

            LOGGER.info(`${ LOGGER_BASE } user with id: '${ params.id }' updated succesfully`);
        } catch (error) {
            res.status(500).json({
                message: {
                    cat: `Error al editar l'usuari amb id: '${ params.id }'`,
                    es: `Error al editar el usuario con id: '${ params.id }'`,
                    eng: `Error editing user with id: '${ params.id }'`
                }
            });

            LOGGER.error(`${ LOGGER_BASE } error updating user with id: '${ params.id }' - Error: ${ error }`);
        }
    } else {
        res.status(400).json({
            message: {
                cat: `No s'ha trobat el usuari amb id: '${ params.id }'`,
                es: `No se ha encontrado el usuario con id: '${ params.id }'`,
                eng: `User with id: '${ params.id }' not found`
            }
        });

        LOGGER.warn(`${ LOGGER_BASE } user with id: '${ params.id }' not found`);
    }
}

export const deleteUser = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `deleteUser@UserController -`;

    const params: any = req.params;

    UserModel.destroy({
        where: {
            id: params.id
        }
    }).then(_ => {
        res.status(200).json({
            message: {
                cat: `S'ha eliminat correctament l'usuari`,
                es: `Se ha eliminado correctamente el usuario`,
                eng: `User successfully deleted`
            }
        });

        LOGGER.info(`${ LOGGER_BASE } deleted user with id: '${ params.id }'`);
    }).catch(error => {
        res.status(500).json({
            message: {
                cat: `Error al eliminar l'usuari amb id: '${ params.id }'`,
                es: `Error al eliminar el usuario con id: '${ params.id }'`,
                eng: `Error deleting user with id: '${ params.id }'`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error deleting user with id: '${ params.id }' - Error: ${ error }`);
    });
}

export const loginUser = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `loginUser@UserController -`;

    const body: UserLogin = req.body;

    try {
        const user: any = await UserModel.findOne({ where: { email: body.email } });

        if (user instanceof UserModel && user != null) {
            if (user.blocked) {
                res.status(405).json({
                    message: {
                        cat: `Aquest usuari no es pot loguejar degut a que està bloquejat`,
                        es: `Este usuario no se puede loguear debido a que está bloqueado`,
                        eng: `This user cannot log in because he is blocked`
                    }
                });

                LOGGER.warn(`${ LOGGER_BASE } user with email: '${ body.email }' can't login because has a blocked account`);
            } else {
                const validPassword: Boolean = await compare(body.password, user.password);
                if (validPassword) {
                    const token = sign({
                        name: user.userName,
                        id: user.id,
                        role: user.role
                    }, process.env.TOKEN_SECRET);
                    res.status(200).json( { token } );

                    LOGGER.info(`${ LOGGER_BASE } user with email: '${ body.email }' and id: '${ user.id }' logged succesfully`);
                } else {
                    res.status(400).json({
                        message: {
                            cat: `La contrasenya és incorrecta`,
                            es: `La contraseña es incorrecta`,
                            eng: `The password is incorrect`
                        }
                    });

                    LOGGER.warn(`${ LOGGER_BASE } user with email: '${ body.email }' and id: '${ user.id }' can't login because the password is wrong`);
                }
            }
        } else {
            res.status(400).json({
                message: {
                    cat: `No s'ha trobat el usuari amb el correu: '${ body.email }'`,
                    es: `No se ha encontrado el usuario con el correo: '${ body.email }'`,
                    eng: `The user with the email: '${ body.email }'' was not found`
                }
            });

            LOGGER.warn(`${ LOGGER_BASE } user with email: '${ body.email }' not found`);
        }
    } catch (error) {
        res.status(500).json({
            message: {
                cat: `Error al realitzar el login`,
                es: `Error al realizar el login`,
                eng: `Login error`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error on doing login with email: '${ body.email }' - Error: ${ error }`);
    }
}

export const blockUser = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `blockUser@UserController -`;

    const params: any = req.params;

    UserModel.update(
        {
            blocked: true
        },
        { where: { id: params.id } }
    ).then(_ => {
        res.status(200).json({
            message: {
                cat: `S'ha bloquejat correctament l'usuari`,
                es: `Se ha bloqueado correctamente el usuario`,
                eng: `User successfully blocked`
            }
        });

        LOGGER.info(`${ LOGGER_BASE } user with id: '${ params.id }' blocked succesfully`);
    }).catch(error => {
        res.status(500).json({
            message: {
                cat: `Error al bloquejar l'usuari amb id: ${ params.id }`,
                es: `Error al bloquear el usuario con id: ${ params.id }`,
                eng: `Error locking user with id: ${ params.id }`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error blocking user with id: '${ params.id }' - Error: ${ error }`);
    });
}

export const unblockUser = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `unblockUser@UserController -`;

    const params: any = req.params;

    UserModel.update(
        {
            blocked: false
        },
        { where: { id: params.id } }
    ).then(_ => {
        res.status(200).json({
            message: {
                cat: `S'ha desbloquejat correctament l'usuari`,
                es: `Se ha desbloqueado correctamente el usuario`,
                eng: `User unlocked successfully`
            }
        });

        LOGGER.info(`${ LOGGER_BASE } user with id: '${ params.id }' unblocked succesfully`);
    }).catch(error => {
        res.status(500).json({
            message: {
                cat: `Error al desbloquejar l'usuari amb id: ${ params.id }`,
                es: `Error al desbloquear el usuario con id: ${ params.id }`,
                eng: `Error unlocking user with id: ${ params.id }`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error unblocking user with id: '${ params.id }' - Error: ${ error }`);
    });
}

export const changeRole = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `changeRole@UserController -`;

    const params: any = req.params;
    const body = req.body;

    UserModel.update(
        {
            role: body.role
        },
        { where: { id: params.id } }
    ).then(_ => {
        res.status(200).json({
            message: {
                cat: `S'ha canviar correctament el rol de l'usuari`,
                es: `Ha cambiado correctamente el rol del usuario`,
                eng: `User role changed successfully`
            }
        });

        LOGGER.info(`${ LOGGER_BASE } changed role of user with id: '${ params.id }' succesfully`);
    }).catch(error => {
        res.status(500).json({
            message: {
                cat: `Error al canviar el rol de l'usuari amb id: ${ params.id }`,
                es: `Error al cambiar el rol del usuario con id: ${ params.id }`,
                eng: `Error changing role for user with id: ${ params.id }`
            }
        });

        LOGGER.error(`${ LOGGER_BASE } error changing the role for user with id: '${ params.id }' - Error: ${ error }`);
    });
}