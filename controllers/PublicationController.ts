import { RouteModel } from './../models/Route';
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
import { ImageModel } from '../models/Image';
import { getCurrentUserByToken } from './UserController';

export const getPublications = async( _ = request, res = response ): Promise<void> => {
    try {
        const publications = await PublicationModel.findAll();
        if (publications instanceof Array && publications.length > 0) {
            const allPublications: Publication[] = await getFullInfoOfPublications(publications);
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
            const allPublications: Publication[] = await getFullInfoOfPublications(publications);
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
            const allPublications: Publication[] = await getFullInfoOfPublications(publications);
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
        const user: JWTUser = await getCurrentUserByToken(req, res);

        const newPublication = {
            title: body.title,
            description: (body.description != null && body.description != undefined) ? body.description : '',
            authorId: user.id,
            countryAlphaCode: body.countryAlphaCode
        };

        const publication: any = await PublicationModel.create(newPublication);
        await publication.save();

        let newRoute = {
            latitudeInital: body.route?.latitudeInitial,
            longitudeInital: body.route?.longitudeInitial,
            latitudeFinal: body.route?.latitudeFinal,
            longitudeFinal: body.route?.longitudeFinal,
            publicationId: publication.id,
            directions: []
        };

        const route: any = await RouteModel.create(newRoute);
        await route.save();

        if (body.route && body.route.directions) {
            const allDirections: Direction[] = body.route.directions;
            for (let i: number = 0; i < allDirections.length; i++) {
                const direction: Direction = allDirections[i];
                const createDirection: any = await DirectionModel.create({
                    latitudeOrigin: direction.latitudeOrigin,
                    longitudeOrigin: direction.longitudeOrigin,
                    latitudeDestiny: direction.latitudeDestiny,
                    longitudeDestiny: direction.longitudeDestiny,
                    routeId: route.id
                });

                await createDirection.save();
            }
            newRoute.directions = allDirections;
        }

        const contents: Content[] = body.contents;
        for (let i: number = 0; i < contents.length; i++) {
            const content: Content = contents[i];
            const createContent: any = await ContentModel.create({
                type: content.type,
                value: content.value,
                position: content.position,
                publicationId: publication.id
            });
            await createContent.save();

            if (content.type == 'image') {
                const createImage = await ImageModel.create({
                    value: createContent.image,
                    contentId: createContent.id
                });
                await createImage.save();
            }
        }

        res.status(200).json({
            title: newPublication.title,
            description: newPublication.description,
            authorId: newPublication.authorId,
            route: newRoute,
            contents: contents
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
        const user: JWTUser = await getCurrentUserByToken(req, res);

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

const getFullInfoOfPublications = async (publications: any): Promise<Publication[]> => {
    let fullPublications: Publication[] = [];

    for (let i: number = 0; i < publications.length; i++) {
        const publication: any = publications[i];
        const fullPublication: Publication = await getAllInfoOfPublication(publication);
        fullPublications.push(fullPublication);
    }

    return fullPublications;
}

export const getAllInfoOfPublication = async(publication: any): Promise<Publication> => {
    const contents: any = await ContentModel.findAll({ where: { publicationId: publication.id } });
    let fullContents: Content[] = [];

    if (contents instanceof Array && contents.length > 0) {
        for (let i: number = 0; i < contents.length; i++) {
            let content: Content = {
                id: contents[i].id,
                type: contents[i].type,
                position: contents[i].position,
                value: null
            };

            if (content.type == 'text') {
                content.value = content.value;
            } else if (content.type == 'image') {
                const image: any = await ImageModel.findOne({ where: { contentId: content.id } });
                if (image instanceof ImageModel && image != null) {
                    content.image = {
                        id: image.id,
                        value: image.value,
                        contentId: image.contentId
                    };
                }
            }

            fullContents.push(content);
        }
    }

    let currentPublication: Publication = {
        id: publication.id,
        title: publication.title,
        description: publication.description,
        authorId: publication.authorId,
        countryAlphaCode: publication.countryAlphaCode,
        contents: fullContents,
        route: null
    };

    const route: any = await RouteModel.findOne({ where: { publicationId: publication.id } });
    if (route instanceof RouteModel && route != null) {
        let allDirections: Direction[] = [];

        const directions: any = await DirectionModel.findAll({ where: { routeId: route.id } });
        if (directions instanceof Array && directions.length > 0) {
            for (let i: number = 0; i < directions.length; i++) {
                const direction: Direction = {
                    latitudeOrigin: directions[i].latitudeOrigin,
                    longitudeOrigin: directions[i].longitudeOrigin,
                    latitudeDestiny: directions[i].latitudeDestiny,
                    longitudeDestiny: directions[i].longitudeDestiny,
                    routeId: route.id
                };
                allDirections.push(direction);
            }
        }

        currentPublication.route = {
            longitudeInitial: route.longitudeInitial,
            latitudeInitial: route.latitudeInitial,
            longitudeFinal: route.longitudeFinal,
            latitudeFinal: route.latitudeFinal,
            directions: allDirections
        };
    }

    return currentPublication;
}