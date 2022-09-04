import { UserPublicationPointModel } from './../models/UserPublicationPoint';
import { UserModel } from './../models/User';
import { PublicationModel } from './../models/Publication';
// Imports
import { response, request } from 'express';
import { JWTUser } from '../interfaces/JWTUser';
import { getCurrentUserByToken } from './UserController';
// Helpers
import { LOGGER } from '../helpers/Logger';

export const userHasGivenPointsToPublication = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `userHasGivenPointsToPublication@PointsController -`;

    const params = req.params;

    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);
        const pointsGiven: any = await UserPublicationPointModel.findOne({
            where: {
                publicationId: params.publicationId,
                userId: user.id
            }
        });

        if (pointsGiven instanceof UserPublicationPointModel && pointsGiven != null) {
            res.status(200).json({
                ok: true
            });
        } else {
            res.status(200).json({
                ok: false
            });
        }
    } catch (error) {
        LOGGER.error(`${ LOGGER_BASE } error getting information about the points given in the publication: '${ params.publicationId }' - Error: ${ error }`);

        res.status(500).json({
            message: {
                cat: `Ha sorgit intentar afegir punts a la publicació amb id: ${ params.publicationId }`,
                es: `Surgió intentar añadir puntos a la publicación con id: ${ params.publicationId }`,
                eng: `An error ocurred while trying to add points to publication with id: ${ params.publicationId }`
            }
        });
    }
}

export const addPointToPublication = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `addPointToPublication@PointsController -`;

    const params = req.params;

    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);
        const publication: any = await PublicationModel.findOne({ 
            where: { 
                id: params.publicationId
            } 
        });

        const pointsGiven: any = await UserPublicationPointModel.findOne({
            where: {
                publicationId: params.publicationId,
                userId: user.id
            }
        });

        if (pointsGiven instanceof UserPublicationPointModel && pointsGiven != null) {
            res.status(400).json({
                message: `L'usuari no pot donar punts més d'un cop a la mateixa publicació`
            });
        } else {
            if (publication instanceof PublicationModel && publication != null) {
                if (publication.authorId == user.id) {
                    res.status(400).json({
                        message: {
                            cat: `L'autor de la publicació no pot afegir punts`,
                            es: `El autor de la publicación no puede añadir puntos`,
                            eng: `The author of the post cannot add points`
                        }
                    });
                } else {
                    const pointsUserPublication: any = await UserPublicationPointModel.create({
                        publicationId: params.publicationId,
                        userId: user.id
                    });
                    await pointsUserPublication.save();

                    const points = Number(publication.points) + 1;
    
                    await publication.update(
                        {
                            points: points
                        },
                        { where: { id: params.publicationId } }
                    );
                    await publication.save();
    
                    const userBd: any = await UserModel.findOne({ where: { id: publication.authorId } });
    
                    let pointsUser = Number(userBd.points) - 1;
    
                    if (pointsUser < 0) {
                        pointsUser = 0;
                    }
    
                    await UserModel.update(
                        {
                            points: pointsUser
                        },
                        { where: { id: publication.authorId } }
                    );
        
                    res.status(200).json({
                        message: {
                            cat: `S'ha afegit un punt a la publicació correctament`,
                            es: `Se ha añadido un punto a la publicación correctamente`,
                            eng: `A point has been added to the post successfully`
                        }
                    });
                }
            } else {
                res.status(400).json({
                    message: {
                        cat: `No existeix cap publicació amb la id: ${ params.publicationId }`,
                        es: `No existe ninguna publicación con la id: ${ params.publicationId }`,
                        eng: `No post exists with id: ${ params.publicationId }`
                    }
                });
            }
        }
    } catch (error) {
        LOGGER.error(`${ LOGGER_BASE } error trying to add points to publication: '${ params.publicationId }' - Error: ${ error }`);

        res.status(500).json({
            message: {
                cat: `Ha sorgit intentar afegir punts a la publicació amb id: ${ params.publicationId }`,
                es: `Surgió intentar añadir puntos a la publicación con id: ${ params.publicationId }`,
                eng: `An error ocurred while trying to add points to publication with id: ${ params.publicationId }`
            }
        });
    }
}

export const removePointToPublication = async ( req = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `addPointToPublication@PointsController -`;

    const params = req.params;

    try {
        const user: JWTUser = await getCurrentUserByToken(req, res);
        const publication: any = await PublicationModel.findOne({ 
            where: { 
                id: params.publicationId
            } 
        });

        const pointsGiven: any = await UserPublicationPointModel.findOne({
            where: {
                publicationId: params.publicationId,
                userId: user.id
            }
        });

        if (pointsGiven instanceof UserPublicationPointModel && pointsGiven != null) {
            if (publication instanceof PublicationModel && publication != null) {
                if (publication.authorId == user.id) {
                    res.status(400).json({
                        message: `L'autor de la publicació no pot restar punts`
                    });
                } else {
                    await UserPublicationPointModel.destroy({
                        where: {
                            publicationId: params.publicationId,
                            userId: user.id
                        }
                    });

                    let points = Number(publication.points) - 1;
    
                    if (points < 0) {
                        points = 0;
                    }
    
                    await publication.update(
                        {
                            points: points
                        },
                        { where: { id: params.publicationId } }
                    );
                    await publication.save();
    
                    const userBd: any = await UserModel.findOne({ where: { id: publication.authorId } });
    
                    let pointsUser = Number(userBd.points) - 1;
    
                    if (pointsUser < 0) {
                        pointsUser = 0;
                    }
    
                    await UserModel.update(
                        {
                            points: pointsUser
                        },
                        { where: { id: publication.authorId } }
                    );
        
                    res.status(200).json({
                        message: {
                            cat: `S'ha tret un punt a la publicació correctament`,
                            es: `Se ha quitado un punto a la publicación correctamente`,
                            eng: `Correctly removed a point from the post`
                        }
                    });
                }
            } else {
                res.status(400).json({
                    message: {
                        cat: `No existeix cap publicació amb la id: ${ params.publicationId }`,
                        es: `No existe ninguna publicación con la id: ${ params.publicationId }`,
                        eng: `No publication exists with id: ${ params.publicationId }`
                    }
                });
            }
        } else {
            res.status(400).json({
                message: {
                    cat: `Aquest usuari no pot treure punts a aquesta publicació degut a que no li ha donat cap punt en primer lloc.`,
                    es: `Este usuario no puede quitar puntos a esta publicación debido a que no le ha dado ningún punto en primer lugar.`,
                    eng: `This user can't take points off this post because they didn't give it any points in the first place.`
                }
            });
        }
    } catch (error) {
        LOGGER.error(`${ LOGGER_BASE } error trying to remove points to publication: '${ params.publicationId }' - Error: ${ error }`);

        res.status(500).json({
            message: {
                cat: `Ha sorgit intentar restar punts a la publicació amb id: ${ params.publicationId }`,
                es: `Surgió intentar restar puntos a la publicación con id: ${ params.publicationId }`,
                eng: `Attempting to subtract points from publication with id: ${ params.publicationId } occurred`
            }
        });
    }
}