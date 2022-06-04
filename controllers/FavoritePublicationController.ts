// Imports
import { response, request } from 'express';
// Interfaces
import { Publication } from '../interfaces/PublicationInterfaces';
// Models
import { FavoritePublicationUserModel } from '../models/FavoritePublicationUser';
import { PublicationModel } from '../models/Publication';
// Functions
import { getCurrentUserByToken } from './UserController';
import { getAllInfoOfPublication } from './PublicationController';
import { JWTUser } from '../interfaces/JWTUser';

export const getFavoritePublicationsOfUser = async ( req = request, res = response ): Promise<void> => {
    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);

        const favorites: any = await FavoritePublicationUserModel.findAll({ where: { userId: user.id }  });
        let publications: Publication[] = [];

        if (favorites instanceof Array && favorites.length > 0) {
            for (let i: number = 0; i < favorites.length; i++) {
                const favorite: any = favorites[i];
                const publication: any = await PublicationModel.findOne({ where: { id: favorite.publicationId } });
                if (publication instanceof PublicationModel && publication != null) {
                    const fullPublication: Publication = await getAllInfoOfPublication(publication);
                    publications.push(fullPublication);
                }
            }
            res.status(200).json( publications );
        } else {
            res.status(200).json( [] );
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({
            message: `Ha sorgit un error al intentar obtenir les publicacions favorites, intenta-ho de nou més tard.`
        });
    }
}

export const checkIfUserHasPublicationOnFavorite = async ( req = request, res = response ): Promise<void> => {
    const params = req.params;

    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);
        const favorites: any = await FavoritePublicationUserModel.findOne({ where: { publicationId: params.publicationId ,userId: user.id }  });

        if (favorites instanceof FavoritePublicationUserModel && favorites != null) {
            res.status(200).json({
                ok: true
            });
        } else {
            res.status(200).json({
                ok: false
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Ha sorgit un error al intentar comprovar si l'usuari té la publicació a favorits`
        });
    }
}

export const addFavoritePublication = async ( req = request, res = response ): Promise<void> => {
    const params = req.params;

    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);
        const favorite: any = await FavoritePublicationUserModel.findOne({ where: { publicationId: params.publicationId, userId: user.id } });

        if (favorite == null || favorite == undefined) {
            const newFavorite: any = {
                publicationId: params.publicationId,
                userId: user.id
            };
            const newData: any = await FavoritePublicationUserModel.create(newFavorite);
            newData.save();
            res.status(200).json({
                message: `S'ha afegit correctament la publicació a favorits`
            });
        } else {
            res.status(400).json({
                message: `Aquest usuari ja té aquesta publicació en favorits`
            });
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({
            message: `Ha sorgit un error al intentar afegir a favorits la publicació amb id: ${ params.publicationId }.`
        });
    }
}

export const removeFavoritePublication = async ( req = request, res = response ): Promise<void> => {
    const params = req.params;

    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);

        FavoritePublicationUserModel.destroy({
            where: {
                userId: user.id,
                publicationId: params.publicationId
            }
        }).then(_ => {
            res.status(200).json({
                message: `S'ha eliminat correctament de favorits`
            });
        }).catch(error => {
            console.error(error);
            res.status(500).json({
                message: `Error al eliminar la publicació ${ params.publicationId } de favorits`
            });
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: `Ha sorgit un error al intentar esborrar de favorits la publicació amb id: ${ params.publicationId }`
        });
    }
}