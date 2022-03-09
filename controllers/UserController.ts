import { response, request } from 'express';
import { UserCreate, UserEdit } from '../interfaces/UserInterfaces';
import { User } from '../models/User';

export const getUsers = async( _ = request, res = response ): Promise<void> => {
    try {
        const users = await User.findAll();
        if (users instanceof Array) {
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
        const user = await User.findAll({ where: { id: params.id } });
        if (user instanceof Array) {
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

export const createUser = async( req = request, res = response ): Promise<void> => {
    const body: UserCreate = req.body;
    
    try {
        const newUser = {
            userName: body.userName,
            email: body.email,
            password: body.password,
            birthDate: body.birthDate
        };

        const user = await User.create(newUser);
        user.save();
        res.status(200).json( user );
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

    User.findAll({ where: { id: params.id } })
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
                res.status(200).json({
                    message: `S'ha editat correctament l'usuari`
                });
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

    User.destroy({
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