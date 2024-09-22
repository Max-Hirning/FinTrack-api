import { FastifyReply, FastifyRequest } from "fastify";
import { budgetServcice } from "@/business/services/wallet";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    createBudgetBody,
    deleteBudgetParam,
    getBudgetsQueries,
    updateBudgetBody,
    updateBudgetParam,
} from "@/business/lib/validation/wallet";

const getBudgets = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getBudgetsQueries;
    }>;
        return budgetServcice.getBudgets(query);
    });
};
const deleteBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteBudgetParam }>;
        await budgetServcice.deleteBudget(params.budgetId);

        return "Budget was removed";
    });
};
const updateBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateBudgetParam;
      Body: updateBudgetBody;
    }>;
        await budgetServcice.updateBudget(params.budgetId, body);

        return "Budget info was updated";
    });
};
const createBudget = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createBudgetBody;
    }>;
        await budgetServcice.createBudget(request.user.id, body);

        return "Budget was created";
    });
};

export const budgetHandler = {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
};
