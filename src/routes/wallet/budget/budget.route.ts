import { FastifyInstance } from "fastify";
import { budgetHandler } from "./budget.handler";
import {
    budgetResponseSchema,
    budgetsListResponseSchema,
    createBudgetBodySchema,
    deleteBudgetParamSchema,
    getBudgetParamSchema,
    getBudgetsQueriesSchema,
    updateBudgetBodySchema,
    updateBudgetParamSchema,
} from "@/business/lib/validation";

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
    fastify.get(
        "/:budgetId",
        {
            schema: {
                response: {
                    200: budgetResponseSchema,
                },
                tags: ["budget"],
                params: getBudgetParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        budgetHandler.getBudget,
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
