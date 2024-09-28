import { Roles } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { categoryHandler } from "./category.handler";
import {
    categoriesResponseSchema,
    createCategoryBodySchema,
    deleteCategoryParamSchema,
    getCategoriesQueriesSchema,
    updateCategoryBodySchema,
    updateCategoryParamSchema,
} from "@/business/lib/validation";

export const categoryRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: categoriesResponseSchema,
                },
                tags: ["category"],
                querystring: getCategoriesQueriesSchema,
            },
        },
        categoryHandler.getCategories,
    );
    fastify.post(
        "/",
        {
            schema: {
                tags: ["category"],
                security: [{ bearerAuth: [] }],
                body: createCategoryBodySchema,
            },
            preHandler: [
                fastify.authorization,
                fastify.checkRole([Roles.guest, Roles.user]),
            ],
        },
        categoryHandler.createCategory,
    );
    fastify.put(
        "/:categoryId",
        {
            schema: {
                tags: ["category"],
                security: [{ bearerAuth: [] }],
                body: updateCategoryBodySchema,
                params: updateCategoryParamSchema,
            },
            preHandler: [
                fastify.authorization,
                fastify.checkRole([Roles.guest, Roles.user]),
            ],
        },
        categoryHandler.updateCategory,
    );
    fastify.delete(
        "/:categoryId",
        {
            schema: {
                tags: ["category"],
                security: [{ bearerAuth: [] }],
                params: deleteCategoryParamSchema,
            },
            preHandler: [
                fastify.authorization,
                fastify.checkRole([Roles.guest, Roles.user]),
            ],
        },
        categoryHandler.deleteCategory,
    );
};
