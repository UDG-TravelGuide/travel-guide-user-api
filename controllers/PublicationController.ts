import { response, request } from 'express';
// Interfaces
import { Publication } from '../interfaces/PublicationInterfaces';
import { Content } from '../interfaces/ContentInterface';
import { Direction } from '../interfaces/DirectionInterface';
import { JWTUser } from '../interfaces/JWTUser';
// Models
import { ContentModel } from '../models/Content';
import { PublicationModel } from '../models/Publication';
import { DirectionModel } from '../models/Direction';
import { ContentDirectionModel } from '../models/ContentDirection';
import { ImageModel } from '../models/Image';
import { CoordinateModel } from '../models/Coordinate';
import { getCurrentUserByToken } from './UserController';

export const getPublications = async( _ = request, res = response ): Promise<void> => {
    try {
        const publications = await PublicationModel.findAll();
        if (publications instanceof Array && publications.length > 0) {
            const allPublications: Publication[] = getFullInfoOfPublications(publications);
            res.json( allPublications );
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

export const getPublicationsByCountry = async( req = request, res = response ): Promise<void> => {
    const params = req.params;

    try {
        const publications: any = await PublicationModel.findAll({ where: { countryAlphaCode: params.country } });
        if (publications instanceof Array && publications.length > 0) {
            const allPublications: Publication[] = getFullInfoOfPublications(publications);
            res.json( allPublications );
        } else {
            res.status(200).json( [] );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error al obtenir les publicacions del pais: ${ params.country }`
        });
    }
}

export const getPublicationsByAuthor = async( req = request, res = response ): Promise<void> => {
    const params = req.params;

    try {
        const publications: any = await PublicationModel.findAll({ where: { authorId: params.authorId } });

        if (publications instanceof Array && publications.length > 0) {
            const allPublications: Publication[] = getFullInfoOfPublications(publications);
            res.json( allPublications );
        } else {
            res.status(200).json( [] );
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Error al obteniur les publicacions amb l'autor amb id: ${ params.authorId }`
        });
    }
}

export const getPublication = async( req = request, res = response ): Promise<void> => {
    const params = req.params;

    try {
        const publication: any = await PublicationModel.findOne({ where: { id: params.id } });
        if (publication instanceof PublicationModel && publication != null) {
            const fullPublication = await getAllInfoOfPublication(publication);
            res.json( fullPublication );
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

        const contents: Content[] = body.contents;
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

export const deletePublication = async( req = request, res = response ): Promise<void> => {
    const params = req.params;

    try {
        const user: JWTUser = await getCurrentUserByToken();

        PublicationModel.destroy({
            where: {
                id: params.publicationId,
                authorId: user.id,
            }
        }).then(_ => {
            res.status(200).json({
                message: `S'ha eliminat correctament la publicació`
            });
        }).catch(error => {
            console.error(error);
            res.status(500).json({
                message: `Error al eliminar la publicació ${ params.publicationId }, no pertany al usuari o no existeix aquesta publicació`
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Ha sorgit un error al intentar esborrar la publicació amb la id: ${ params.publicationId }`
        });
    }
}

const getFullInfoOfPublications = (publications: any): Publication[] => {
    let fullPublications: Publication[] = [];

    publications.forEach(async (publication: any) => {
        const fullPublication: Publication = await getAllInfoOfPublication(publication);
        fullPublications.push(fullPublication);
    });

    return fullPublications;
}

export const getAllInfoOfPublication = async(publication: any): Promise<Publication> => {
    const contents = await ContentModel.findAll({ where: { publicationId: publication.id } });
    let fullContents: Content[] = [];

    if (contents instanceof Array && contents.length > 0) {
        contents.forEach(async (content: any) => {
            let currentContent: Content = {
                id: content.id,
                type: content.type,
                position: content.position,
                value: null
            };

            if (currentContent.type == 'text') {
                currentContent.value = content.value;
            } else if (currentContent.type == 'image') {
                const image: any = await ImageModel.findOne({ where: { contentId: currentContent.id } });
                if (image instanceof ImageModel && image != null) {
                    currentContent.image = {
                        id: image.id,
                        value: image.value,
                        contentId: image.contentId
                    };
                }
            } else if (currentContent.type == 'route') {
                currentContent.directions = [];
                const contentDirections: any = await ContentDirectionModel.findAll({ where: { contentId: currentContent.id } });
                if (contentDirections instanceof Array && contentDirections.length > 0) {
                    contentDirections.forEach(async (contentDirection: any) => {
                        const direction: any = await DirectionModel.findOne({ where: { id: contentDirection.directionId } });
                        if (direction instanceof DirectionModel && direction != null) {
                            const coordinateOrign: any = await CoordinateModel.findOne({ where: { id: direction.coordinateOrigin } });
                            const coordinateDestiny: any = await CoordinateModel.findOne({ where: { id: direction.coordinateDestiny } });

                            if (coordinateOrign instanceof CoordinateModel && coordinateOrign != null &&
                                coordinateDestiny instanceof CoordinateModel && coordinateDestiny != null) {
                                currentContent.directions.push({
                                    coordinateOrigin: {
                                        id: coordinateOrign.id,
                                        latitude: coordinateOrign.latitude,
                                        longitude: coordinateOrign.longitude
                                    },
                                    coordinateDestiny: {
                                        id: coordinateDestiny.id,
                                        latitude: coordinateDestiny.latitude,
                                        longitude: coordinateDestiny.longitude
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    const currentPublication: Publication = {
        id: publication.id,
        title: publication.title,
        description: publication.description,
        authorId: publication.authorId,
        countryNumericCode: publication.countryNumericCode,
        contents: fullContents,
    };

    return currentPublication;
}