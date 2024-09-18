import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma/prisma";

type PrismaType = typeof prisma;
type Model = Prisma.ModelName;
/*
 * Generate a repository for a given model.
 * Contains all the CRUD operations for the model from the Prisma client.
 * */
export const generateRepository = (model: Model) => {
    const modelInstanceName = model.toLowerCase() as Lowercase<Model>;

    type ModelLC = Lowercase<Model>;

    type CreateArgs = Prisma.Args<PrismaType[ModelLC], "create">;
    type FindManyArgs = Prisma.Args<PrismaType[ModelLC], "findMany">;
    type FindUniqueArgs = Prisma.Args<PrismaType[ModelLC], "findUnique">;
    type FindFirstArgs = Prisma.Args<PrismaType[ModelLC], "findFirst">;
    type UpdateArgs = Prisma.Args<PrismaType[ModelLC], "update">;
    type PurgeArgs = Prisma.Args<PrismaType[ModelLC], "delete">;
    type CountArgs = Prisma.Args<PrismaType[ModelLC], "count">;
    type CreateManyArgs = Prisma.Args<PrismaType[ModelLC], "createMany">;
    type UpsertArgs = Prisma.Args<PrismaType[ModelLC], "upsert">;
    type UpdateManyArgs = Prisma.Args<PrismaType[ModelLC], "updateMany">;

    const create = <T extends CreateArgs>(
        args: Prisma.SelectSubset<T, CreateArgs>
    ) => {
        return prisma[modelInstanceName].create(args);
    };

    const createMany = <T extends CreateManyArgs>(
        args: Prisma.SelectSubset<T, CreateManyArgs>
    ) => {
        return prisma[modelInstanceName].createMany(args);
    };

    const findMany = <T extends FindManyArgs>(
        args: Prisma.SelectSubset<T, FindManyArgs>
    ) => {
        return prisma[modelInstanceName].findMany(args);
    };

    const count = <T extends CountArgs>(
        args: Prisma.SelectSubset<T, CountArgs>
    ) => {
        return prisma[modelInstanceName].count(args);
    };

    const findUnique = <T extends FindUniqueArgs>(
        args: Prisma.SelectSubset<T, FindUniqueArgs>
    ) => {
        return prisma[modelInstanceName].findUnique(args);
    };

    const findFirst = <T extends FindFirstArgs>(
        args: Prisma.SelectSubset<T, FindFirstArgs>
    ) => {
        return prisma[modelInstanceName].findFirst(args);
    };

    const update = <T extends UpdateArgs>(
        args: Prisma.SelectSubset<T, UpdateArgs>
    ) => {
        return prisma[modelInstanceName].update(args);
    };

    const upsert = <T extends UpsertArgs>(
        args: Prisma.SelectSubset<T, UpsertArgs>
    ) => {
        return prisma[modelInstanceName].upsert(args);
    };

    const updateMany = <T extends UpdateManyArgs>(
        args: Prisma.SelectSubset<T, UpdateManyArgs>
    ) => {
        return prisma[modelInstanceName].updateMany(args);
    };

    const deleteOne = <T extends PurgeArgs>(
        args: Prisma.SelectSubset<T, PurgeArgs>
    ) => {
        return prisma[modelInstanceName].delete(args);
    };

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
