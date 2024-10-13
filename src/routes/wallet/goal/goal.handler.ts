import { goalServcice } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    createGoalBody,
    deleteGoalParam,
    getGoalParam,
    getGoalsQueries,
    updateGoalBody,
    updateGoalParam,
} from "@/business/lib/validation";

const getGoal = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: getGoalParam }>;
        return goalServcice.find({ id: params.goalId });
    });
};
const getGoals = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getGoalsQueries;
    }>;
        return goalServcice.getGoals(query);
    });
};
const deleteGoal = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteGoalParam }>;
        await goalServcice.deleteGoal(params.goalId);

        return "Goal was removed";
    });
};
const updateGoal = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateGoalParam;
      Body: updateGoalBody;
    }>;
        await goalServcice.updateGoal(params.goalId, body);

        return "Goal info was updated";
    });
};
const createGoal = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createGoalBody;
    }>;
        await goalServcice.createGoal(request.user.id, body);

        return "Goal was created";
    });
};

export const goalHandler = {
    getGoal,
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
};
