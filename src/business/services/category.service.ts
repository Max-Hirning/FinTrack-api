import { deleteCache } from "../lib/redis";
import { environmentVariables } from "@/config";
import { prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import {
    createCategoryBody,
    updateCategoryBody,
    getCategoriesQueries,
} from "../lib/validation";

const find = async (categoryId: string) => {
    try {
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        });
        return category;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const getCategories = async (query: getCategoriesQueries) => {
    const { userIds, type } = query;
    const categories = await prisma.category.findMany({
        where: {
            OR: [
                {
                    userId: null,
                },
                {
                    userId: {
                        in: userIds || [],
                    },
                },
            ],
            ...(type
                ? {
                    type,
                }
                : {}),
        },
        orderBy: {
            userId: "asc",
        },
    });
    return categories.map((el) => ({
        ...el,
        image: `${environmentVariables.API_URL}/assets/category/${el.image}.svg`,
    }));
};
const createCategory = async (payload: createCategoryBody, userId?: string) => {
    let category;
    try {
        category = await prisma.category.create({
            data: {
                userId,
                type: payload.type,
                title: payload.title,
                color: payload.color,
                image: payload.imageId,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
    if (userId) await deleteCache(userId);
    return category;
};
const updateCategory = async (
    categoryId: string,
    payload: updateCategoryBody,
) => {
    let category;
    try {
        category = await prisma.category.update({
            where: {
                id: categoryId,
            },
            data: {
                type: payload.type,
                title: payload.title,
                color: payload.color,
                image: payload.imageId,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
    if (category.userId) await deleteCache(category.userId);
    return category;
};
const deleteCategory = async (categoryId: string) => {
    let category;
    try {
        category = await prisma.category.delete({
            where: {
                id: categoryId,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
    if (category.userId) await deleteCache(category.userId);
    return category;
};

export const categoryService = {
    find,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
