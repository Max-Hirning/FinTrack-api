import { FastifyInstance } from "fastify";
import { budgetHandler } from "./budget.handler";
import {
    budgetsListResponseSchema,
    createBudgetBodySchema,
    deleteBudgetParamSchema,
    getBudgetsQueriesSchema,
    updateBudgetBodySchema,
    updateBudgetParamSchema,
} from "@/business/lib/validation/wallet";

export const budgetRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: budgetsListResponseSchema,
                },
                tags: ["budget"],
                security: [{ bearerAuth: [] }],
                querystring: getBudgetsQueriesSchema,
            },
            preHandler: [fastify.authorization],
        },
        budgetHandler.getBudgets,
    );
    fastify.put(
        "/:budgetId",
        {
            schema: {
                tags: ["budget"],
                body: updateBudgetBodySchema,
                params: updateBudgetParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        budgetHandler.updateBudget,
    );
    fastify.delete(
        "/:budgetId",
        {
            schema: {
                tags: ["budget"],
                params: deleteBudgetParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        budgetHandler.deleteBudget,
    );
    fastify.post(
        "/",
        {
            schema: {
                tags: ["budget"],
                body: createBudgetBodySchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        budgetHandler.createBudget,
    );
};
