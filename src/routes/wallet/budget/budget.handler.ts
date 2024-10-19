import { RedisKey } from "@/business/constants";
import { deleteCache } from "@/business/lib/redis";
import { budgetServcice } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import {
    redisGetSetCacheMiddleware,
    tryCatchApiMiddleware,
} from "@/business/lib/middleware";
import {
    createBudgetBody,
    deleteBudgetParam,
    getBudgetParam,
    getBudgetsQueries,
    updateBudgetBody,
    updateBudgetParam,
} from "@/business/lib/validation";

const getBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: getBudgetParam;
    }>;
        const { budgetId } = params;
        return redisGetSetCacheMiddleware(
            `${RedisKey.budget}_${budgetId}`,
            async () => {
                const response = await budgetServcice.find({ id: params.budgetId });
                return {
                    code: 200,
                    data: {
                        ...response,
                        cards: response.cards.map((el) => el.id),
                        categories: response.categories.map((el) => el.id),
                    },
                };
            },
        );
    });
};
const getBudgets = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getBudgetsQueries;
    }>;
        const { page, userIds, budgetIds, currencies } = query;
        return redisGetSetCacheMiddleware(
            `${RedisKey.budget}${(userIds || []).map((el) => `_${el}`)}${(budgetIds || []).map((el) => `_${el}`)}${(currencies || []).map((el) => `_${el}`)}_${page}`,
            async () => {
                return {
                    code: 200,
                    data: budgetServcice.getBudgets(query),
                };
            },
        );
    });
};
const deleteBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteBudgetParam }>;
        const budget = await budgetServcice.deleteBudget(params.budgetId);

        await deleteCache(`${RedisKey.budget}_${budget.userId}`);

        return {
            code: 200,
            data: "Budget was removed",
        };
    });
};
const updateBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateBudgetParam;
      Body: updateBudgetBody;
    }>;
        const budget = await budgetServcice.updateBudget(params.budgetId, body);

        await deleteCache(`${RedisKey.budget}_${budget.userId}`);

        return {
            code: 200,
            data: "Budget info was updated",
        };
    });
};
const createBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createBudgetBody;
    }>;
        const budget = await budgetServcice.createBudget(request.user.id, body);

        await deleteCache(`${RedisKey.budget}_${budget.userId}`);

        return {
            code: 201,
            data: "Budget was created",
        };
    });
};

export const budgetHandler = {
    getBudget,
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
};
