import { response, request } from 'express';
import { hash, genSalt, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken';
import { UserCreate, UserEdit, UserLogin } from '../interfaces/UserInterfaces';
import { UserModel } from '../models/User';

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
        const user = await UserModel.findAll({ where: { id: params.id } });
        if (user instanceof Array && user.length > 0) {
            res.json( user[0] );
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

// TODO: Evitar mails repetits
export const createUser = async( req = request, res = response ): Promise<void> => {
    const body: UserCreate = req.body;
    
    try {
        const salt = await genSalt(10);
        const hashedPassword = await hash(body.password, salt);

        const newUser = {
            userName: body.userName,
            email: body.email,
            password: hashedPassword,
            birthDate: body.birthDate
        };

        const user = await UserModel.create(newUser);
        user.save();
        res.status(200).json( user );
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error al crear l'usuari nou`
        });
    }
}

// TODO: Evitar editar mail
export const editUser = async( req = request, res = response ): Promise<void> => {
    const params: any = req.params;
    const body: UserEdit = req.body;

    UserModel.findAll({ where: { id: params.id } })
    .then(user => {
        if (user instanceof Array) {
            const editFields: UserEdit = {
                userName: body.userName,
                password: body.password,
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
                    id: user.id
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