import { categoryService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError } from "@/business/lib/errors";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    createCategoryBody,
    deleteCategoryParam,
    getCategoriesQueries,
    updateCategoryBody,
} from "@/business/lib/validation";

const createCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{ Body: createCategoryBody }>;
        await categoryService.createCategory(body);

        return "Budget was removed";
    });
};
const getCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getCategoriesQueries;
    }>;
        const data = await categoryService.getCategories(query.userIds);

        return data;
    });
};
const updateCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: deleteCategoryParam;
      Body: updateCategoryBody;
    }>;
        const category = await categoryService.find(params.categoryId);
        if (category?.userId !== request.user.id)
            throw new ForbiddenError("You have no rights");
        await categoryService.updateCategory(params.categoryId, body);

        return "Category was updated";
    });
};
const deleteCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: deleteCategoryParam;
    }>;
        const category = await categoryService.find(params.categoryId);
        if (category?.userId !== request.user.id)
            throw new ForbiddenError("You have no rights");
        await categoryService.deleteCategory(params.categoryId);

        return "Category was removed";
    });
};

export const categoryHandler = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
