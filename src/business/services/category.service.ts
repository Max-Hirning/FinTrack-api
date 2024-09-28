import { prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import { createCategoryBody, updateCategoryBody } from "../lib/validation";

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
const getCategories = async (userId?: string[]) => {
    const categories = await prisma.category.findMany({
        where: {
            AND: [
                {
                    userId: {
                        in: userId || [],
                    },
                },
                {
                    userId: undefined,
                },
            ],
        },
    });
    return categories;
};
const createCategory = async (payload: createCategoryBody) => {
    let category;
    try {
        category = await prisma.category.create({
            data: {
                title: payload.title,
                color: payload.color,
                image: payload.image,
                userId: payload.userId,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
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
                title: payload.title,
                color: payload.color,
                image: payload.image,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
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
    return category;
};

export const categoryService = {
    find,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
