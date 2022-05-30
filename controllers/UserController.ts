import { response, request } from 'express';
import { hash, genSalt, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken';
import { UserCreate, UserEdit, UserLogin } from '../interfaces/UserInterfaces';
import { UserModel } from '../models/User';
import { JWTUser } from '../interfaces/JWTUser';

export const getUsers = async( _ = request, res = response ): Promise<void> => {
    try {
        const users = await UserModel.findAll();
        if (users instanceof Array && users.length > 0) {
            res.json( users );
        } else {
            res.json( [] );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al obtenir els usuaris'
        });
    }
}

export const getUser = async( req = request, res = response ): Promise<void> => {
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
        } else {
            res.status(400).json({
                message: `No s'ha trobat el usuari amb id: ${ params.id }`
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error al obtenir l'usuari amb id: ${ params.id }`
        });
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
        res.json({
            id: user.id,
            userName: user.name
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
        const refreshToken = sign({
            name: user.name,
            id: user.id
        }, process.env.TOKEN_SECRET);

        res.status(200).json({
            refreshToken: refreshToken
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
        const users = await UserModel.findAll({ where: { email: body.email } });

        if (users instanceof Array && users.length > 0) {
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

    UserModel.findAll({ where: { id: params.id } })
    .then(async (user) => {
        if (user instanceof Array) {
            const salt = await genSalt(10);
            const hashedPassword = await hash(body.password, salt);

            const editFields: UserEdit = {
                userName: body.userName,
                password: hashedPassword,
                birthDate: body.birthDate,
                profilePhoto: body.profilePhoto
            };

            try {
                user[0].update( editFields, {
                    where: { id: params.id }
                });
                user[0].save();
                res.status(200).json( user[0] );
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
    })
    .catch(error => {
        console.error(error);
        res.status(500).json({
            message: `Error al obtenir l'usuari amb id: ${ params.id }`
        });
    });
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
        const users = await UserModel.findAll({ where: { email: body.email } });
        if (users instanceof Array && users.length > 0) {
            const user: any = users[0];
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
        } else {
            res.status(400).json({
                message: `No s'ha trobat el usuari amb email: ${ body.email }`
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