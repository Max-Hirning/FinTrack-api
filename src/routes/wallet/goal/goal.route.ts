import { FastifyInstance } from "fastify";
import { goalHandler } from "./goal.handler";
import {
    goalsListResponseSchema,
    createGoalBodySchema,
    deleteGoalParamSchema,
    getGoalsQueriesSchema,
    updateGoalBodySchema,
    updateGoalParamSchema,
} from "@/business/lib/validation";

export const goalRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: goalsListResponseSchema,
                },
                tags: ["goal"],
                security: [{ bearerAuth: [] }],
                querystring: getGoalsQueriesSchema,
            },
            preHandler: [fastify.authorization],
        },
        goalHandler.getGoals,
    );
    fastify.put(
        "/:goalId",
        {
            schema: {
                tags: ["goal"],
                body: updateGoalBodySchema,
                params: updateGoalParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        goalHandler.updateGoal,
    );
    fastify.delete(
        "/:goalId",
        {
            schema: {
                tags: ["goal"],
                params: deleteGoalParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        goalHandler.deleteGoal,
    );
    fastify.post(
        "/",
        {
            schema: {
                tags: ["goal"],
                body: createGoalBodySchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        goalHandler.createGoal,
    );
};
