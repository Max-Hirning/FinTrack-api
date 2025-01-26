import { budgetServcice } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    budgetResponse,
    budgetsListResponse,
    createBudgetBody,
    deleteBudgetParam,
    getBudgetParam,
    getBudgetsQueries,
    updateBudgetBody,
    updateBudgetParam,
} from "@/business/lib/validation";

const getBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware<budgetResponse>(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: getBudgetParam;
    }>;
        const response = await budgetServcice.find({ id: params.budgetId });
        return {
            code: 200,
            data: {
                ...response,
                cards: response.cards.map((el) => el.id),
                categories: response.categories.map((el) => el.id),
            },
        };
    });
};
const getBudgets = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware<budgetsListResponse>(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getBudgetsQueries;
    }>;
        const response = await budgetServcice.getBudgets(query);
        return {
            code: 200,
            data: response,
        };
    });
};
const deleteBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteBudgetParam }>;
        await budgetServcice.deleteBudget(params.budgetId);

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
        await budgetServcice.updateBudget(params.budgetId, body);

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
        await budgetServcice.createBudget(request.user.id, body);

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
