import { categoryService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";

const getCategories = async (_: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        return categoryService.getCategories({});
    });
};
const getCategoryGroups = async (_: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        return categoryService.getCategories({ grouped: true });
    });
};

export const categoryHandler = {
    getCategories,
    getCategoryGroups,
};
