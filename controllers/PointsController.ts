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

        if (publication instanceof PublicationModel && publication != null) {
            if (publication.authorId == user.id) {
                res.status(400).json({
                    message: `L'autor de la publicació no pot afegir punts`
                });
            } else {
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

        if (publication instanceof PublicationModel && publication != null) {
            if (publication.authorId == user.id) {
                res.status(400).json({
                    message: `L'autor de la publicació no pot restar punts`
                });
            } else {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Ha sorgit intentar restar punts a la publicació amb id: ${ params.publicationId }`
        });
    }
}