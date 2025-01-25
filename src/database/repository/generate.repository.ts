import { Prisma } from "@prisma/client";

import { prisma } from "../prisma/prisma";

type Model = Prisma.ModelName;

/*
 * Generate a repository for a given model.
 * Contains all the CRUD operations for the model from the Prisma client.
 * */
export const generateRepository = <T extends Model>(model: T) => {
    const modelInstanceName = uncapitalizeString(model);

    const delegate = prisma[modelInstanceName];

    const create = delegate["create"] as (typeof delegate)["create"];

    const createMany = delegate["createMany"] as (typeof delegate)["createMany"];

    const count = delegate["count"] as (typeof delegate)["count"];

    const findUnique = delegate["findUnique"] as (typeof delegate)["findUnique"];

    const findFirst = delegate["findFirst"] as (typeof delegate)["findFirst"];
    const update = delegate["update"] as (typeof delegate)["update"];
    const upsert = delegate["upsert"] as (typeof delegate)["upsert"];

    const updateMany = delegate["updateMany"] as (typeof delegate)["updateMany"];

    const deleteOne = delegate["delete"] as (typeof delegate)["delete"];
    const findMany = delegate["findMany"] as (typeof delegate)["findMany"];

    return {
        create,
        createMany,
        findMany,
        count,
        findUnique,
        findFirst,
        update,
        upsert,
        updateMany,
        delete: deleteOne,
    };
};

export const uncapitalizeString = <T extends string>(
    str: T,
): Uncapitalize<T> => {
    return (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<T>;
};
