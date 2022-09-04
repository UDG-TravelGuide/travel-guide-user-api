import { ParamsDictionary } from 'express-serve-static-core';

export const getPageAndLimit = (params: ParamsDictionary): { limit: number, offset: number } => {
    const limit: number = (params.limit != null && params.limit != undefined) ? Number(params.limit) : 10;
    const offset: number = (params.page != null && params.page != undefined) ? Number(params.page) * 10 : 0;

    return {
        limit,
        offset
    };
}