import { UserPublicationPointModel } from './../models/UserPublicationPoint';
import { UserModel } from './../models/User';
import { PublicationModel } from './../models/Publication';
// Imports
import { response, request } from 'express';
import { JWTUser } from '../interfaces/JWTUser';
import { getCurrentUserByToken } from './UserController';

export const addPointToPublication = async( req = request, res = response ): Promise<void> => {
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
                        message: `L'autor de la publicació no pot afegir punts`
                    });
                } else {
                    const pointsUserPublication: any = await UserPublicationPointModel.create({
                        publicationId: params.publicationId,
                        userId: user.id
                    });
                    await pointsUserPublication.save();

                    const points = Number(publication.points) + 1;
    
                    await PublicationModel.update(
                        {
                            points: points
                        },
                        { where: { id: params.publicationId } }
                    );
    
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
                        message: `S'ha afegit un punt a la publicació correctament`
                    });
                }
            } else {
                res.status(400).json({
                    message: `No existeix cap publicació amb la id: ${ params.publicationId }`
                });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Ha sorgit intentar afegir punts a la publicació amb id: ${ params.publicationId }`
        });
    }
}

export const removePointToPublication = async( req = request, res = response ): Promise<void> => {
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
    
                    await PublicationModel.update(
                        {
                            points: points
                        },
                        { where: { id: params.publicationId } }
                    );
    
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
                        message: `S'ha afegit un punt a la publicació correctament`
                    });
                }
            } else {
                res.status(400).json({
                    message: `No existeix cap publicació amb la id: ${ params.publicationId }`
                });
            }
        } else {
            res.status(400).json({
                message: `Aquest usuari no pot treure punts a aquesta publicació degut a que no li ha donat cap punt en primer lloc.`
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Ha sorgit intentar restar punts a la publicació amb id: ${ params.publicationId }`
        });
    }
}