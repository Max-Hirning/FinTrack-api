import { FastifyInstance } from "fastify";
import { categoryHandler } from "./category.handler";
import {
    categoriesChildSchema,
    categoriesGroupsSchema,
} from "@/business/lib/validation";

export const categoryRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: categoriesChildSchema,
                },
                tags: ["category"],
            },
        },
        categoryHandler.getCategories,
    );

    fastify.get(
        "/group",
        {
            schema: {
                response: {
                    200: categoriesGroupsSchema,
                },
                tags: ["category"],
            },
        },
        categoryHandler.getCategoryGroups,
    );
};
