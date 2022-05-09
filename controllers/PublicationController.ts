import { response, request } from 'express';
// Interfaces
import { Publication } from '../interfaces/PublicationInterfaces';
import { Content } from '../interfaces/ContentInterface';
import { Direction } from '../interfaces/DirectionInterface';
// Models
import { ContentModel } from '../models/Content';
import { PublicationModel } from '../models/Publication';
import { DirectionModel } from '../models/Direction';
import { ContentDirectionModel } from '../models/ContentDirection';
import { ImageModel } from '../models/Image';
import { CoordinateModel } from '../models/Coordinate';

export const getPublications = async( _ = request, res = response ): Promise<void> => {
    try {
        const publications = await PublicationModel.findAll();
        if (publications instanceof Array && publications.length > 0) {
            res.json( publications );
        } else {
            res.json( [] );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al obtenir les publicacions'
        });
    }
}

export const getPublication = async( req = request, res = response ): Promise<void> => {
    const params = req.params;

    try {
        const publications = await PublicationModel.findAll({ where: { id: params.id } });
        if (publications instanceof Array && publications.length > 0) {
            res.json( publications[0] );
        } else {
            res.status(400).json({
                message: `No s'ha trobat la publicacio amb id: ${ params.id }`
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error al obtenir la publicacio amb id: ${ params.id }`
        });
    }
}

export const createPublication = async( req = request, res = response ): Promise<void> => {
    const body: Publication = req.body;

    try {
        const newPublication = {
            title: body.title,
            description: (body.description != null && body.description != undefined) ? body.description : '',
            authorId: body.authorId
        };

        const publication: any = await PublicationModel.create(newPublication);
        publication.save();

        const contents: Content[] = body.content;
        contents.forEach(async (content: Content) => {
            const createContent: any = await ContentModel.create({
                type: content.type,
                value: content.value,
                position: content.position,
                publicationId: publication.id
            });
            createContent.save();

            if (content.type == 'route') {
                const directions: Direction[] = content.directions;
                directions.forEach(async (direction: Direction) => {
                    const createCoordinateOrigin: any = await CoordinateModel.create({
                        latitude: direction.coordinateOrigin.latitude,
                        longitude: direction.coordinateOrigin.longitude
                    });
                    createCoordinateOrigin.save();

                    const createCoordinateDestiny: any = await CoordinateModel.create({
                        latitude: direction.coordinateDestiny.latitude,
                        longitude: direction.coordinateDestiny.longitude
                    });
                    createCoordinateDestiny.save();

                    const createDirection: any = await DirectionModel.create({
                        coordinateOrigin: createCoordinateOrigin.id,
                        coordinateDestiny: createCoordinateDestiny.id
                    });
                    createDirection.save();

                    const createDirectionModel = await ContentDirectionModel.create({
                        contentId: createContent.id,
                        directionId: createDirection.id
                    });
                    createDirectionModel.save();
                });  
            } else if (content.type == 'image') {
                const createImage = await ImageModel.create({
                    value: createContent.image,
                    contentId: createContent.id
                });
                createImage.save();
            }
        });

        res.status(200).json({
            title: newPublication.title,
            description: newPublication.description,
            authorId: newPublication.authorId,
            content: contents
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error al crear la publicació`
        });
    }
}