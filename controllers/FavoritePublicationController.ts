import { ParamsDictionary } from 'express-serve-static-core';
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
import { getPageAndLimit } from '../helpers/Paginate';
// Helpers
import { LOGGER } from '../helpers/Logger';

export const getFavoritePublicationsOfUser = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `getFavoritePublicationsOfUser@FavoritePublicationController -`;

    const params: ParamsDictionary = req.params;

    try {
        const { limit, offset } : { limit: number; offset: number; } = getPageAndLimit(params);
        
        const user: JWTUser = await getCurrentUserByToken(req, res);

        const favorites: any = await FavoritePublicationUserModel.findAndCountAll({ 
            where: { userId: user.id },
            limit: limit,
            offset: offset
        });
        let publications: Publication[] = [];

        if (favorites.rows instanceof Array && favorites.rows.length > 0) {
            const num: number = Math.abs(favorites.count / 10);
            const numPages: number = num > 0 ? num : 1;

            for (let i: number = 0; i < favorites.rows.length; i++) {
                const favorite: any = favorites.rows[i];
                const publication: any = await PublicationModel.findOne({ where: { id: favorite.publicationId } });
                if (publication instanceof PublicationModel && publication != null) {
                    const fullPublication: Publication = await getAllInfoOfPublication(publication);
                    publications.push(fullPublication);
                }
            }
            res.status(200).json({
                publications,
                page: offset,
                pages: numPages
            });
        } else {
            res.status(200).json( [] );
        }
    } catch (error) {
        LOGGER.error(`${ LOGGER_BASE } error obtaining favorite publications of user - Error: ${ error }`);

        res.status(401).json({
            message: {
                cat: `Ha sorgit un error al intentar obtenir les publicacions favorites, intenta-ho de nou més tard.`,
                es: `Surgió un error al intentar obtener las publicaciones favoritas, inténtalo de nuevo más tarde.`,
                eng: `An error occurred while trying to get the favorite posts, please try again later.`
            }
        });
    }
}

export const checkIfUserHasPublicationOnFavorite = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `checkIfUserHasPublicationOnFavorite@FavoritePublicationController -`;

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
        LOGGER.error(`${ LOGGER_BASE } error checking if user has publication '${ params.publicationId }' on favorite - Error: ${ error }`);

        res.status(500).json({
            message: {
                cat: `Ha sorgit un error al intentar comprovar si l'usuari té la publicació a favorits`,
                es: `Surgió un error al intentar comprobar si el usuario tiene la publicación en favoritos`,
                eng: `An error occurred while trying to check if the user has the post favorited`
            }
        });
    }
}

export const addFavoritePublication = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `addFavoritePublication@FavoritePublicationController -`;

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
                message: {
                    cat: `S'ha afegit correctament la publicació a favorits`,
                    es: `Se ha añadido correctamente la publicación a favoritos`,
                    eng: `Post successfully added to favorites`
                }
            });
        } else {
            res.status(400).json({
                message: {
                    cat: `Aquest usuari ja té aquesta publicació en favorits`,
                    es: `Este usuario ya tiene esta publicación en favoritos`,
                    eng: `This user already has this post in favorites`
                }
            });
        }
    } catch (error) {
        LOGGER.error(`${ LOGGER_BASE } error adding publication '${ params.publicationId }' on favorites - Error: ${ error }`);

        res.status(500).json({
            message: {
                cat: `Ha sorgit un error al intentar afegir a favorits la publicació amb id: '${ params.publicationId }'.`,
                es: `Surgió un error al intentar añadir a favoritos la publicación con id: '${ params.publicationId }'`,
                eng: `An error occurred while trying to favorite the post with id: '${ params.publicationId }'`
            }
        });
    }
}

export const removeFavoritePublication = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `removeFavoritePublication@FavoritePublicationController -`;

    const params = req.params;

    const user: JWTUser = await getCurrentUserByToken(req, res);

    FavoritePublicationUserModel.destroy({
        where: {
            userId: user.id,
            publicationId: params.publicationId
        }
    }).then(_ => {
        res.status(200).json({
            message: {
                cat: `S'ha eliminat correctament de favorits`,
                es: `Se ha eliminado correctamente de favoritos`,
                eng: `Successfully removed from favorites`
            }
        });
    }).catch(error => {
        LOGGER.error(`${ LOGGER_BASE } error adding publication '${ params.publicationId }' on favorites - Error: ${ error }`);

        res.status(500).json({
            message: {
                cat: `Error al eliminar la publicació '${ params.publicationId }' de favorits`,
                es: `Error al eliminar la publicación '${ params.publicationId }' de favoritos`,
                eng: `Error removing publication '${ params.publicationId }' from favorites`
            }
        });
    });
}