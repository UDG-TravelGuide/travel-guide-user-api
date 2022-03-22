import { response, request } from 'express';
import { PublicationModel } from '../models/Publication';
import { Publication } from '../interfaces/PublicationInterfaces';
import { Content } from '../interfaces/ContentInterface';
import { ContentMoldel } from '../models/Content';

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

// TODO: Afegir filtres i variacions
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

// TODO: Afegir validacions
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
        contents.forEach(async (content) => {
            const createContent = await ContentMoldel.create({
                type: content.type,
                value: content.value,
                position: content.position,
                publicationId: publication.id
            });
            createContent.save();
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
            message: `Error al crear la publicacio`
        });
    }
}