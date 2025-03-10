import { Roles } from "@prisma/client";
import { categoryService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError } from "@/business/lib/errors";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    categoriesResponse,
    createCategoryBody,
    deleteCategoryParam,
    getCategoriesQueries,
    updateCategoryBody,
} from "@/business/lib/validation";

const createCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body, user } = request as FastifyRequest<{
      Body: createCategoryBody;
    }>;
        const userId = user.role !== Roles.admin ? user.id : undefined;
        await categoryService.createCategory(body, userId);

        return {
            code: 201,
            data: "Category was created",
        };
    });
};
const getCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware<categoriesResponse>(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getCategoriesQueries;
    }>;
        return {
            code: 200,
            data: await categoryService.getCategories(query),
        };
    });
};
const updateCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: deleteCategoryParam;
      Body: updateCategoryBody;
    }>;
        const category = await categoryService.find(params.categoryId);
        if (
            request.user.role !== Roles.admin &&
      category?.userId !== request.user.id
        )
            throw new ForbiddenError("You have no rights");
        await categoryService.updateCategory(params.categoryId, body);

        return {
            code: 200,
            data: "Category was updated",
        };
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

        return {
            code: 200,
            data: "Category was removed",
        };
    });
};

export const categoryHandler = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
