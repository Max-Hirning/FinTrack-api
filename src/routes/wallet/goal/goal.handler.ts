import { RedisKey } from "@/business/constants";
import { goalServcice } from "@/business/services";
import { deleteCache } from "@/business/lib/redis";
import { FastifyReply, FastifyRequest } from "fastify";
import {
    redisGetSetCacheMiddleware,
    tryCatchApiMiddleware,
} from "@/business/lib/middleware";
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
        const { goalId } = params;
        return redisGetSetCacheMiddleware(
            `${RedisKey.goal}_${goalId}`,
            async () => {
                const response = await goalServcice.find({ id: params.goalId });
                return {
                    code: 200,
                    data: {
                        ...response,
                        deadline: response.deadline.toISOString(),
                    },
                };
            },
        );
    });
};
const getGoals = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getGoalsQueries;
    }>;
        const { page, userIds, goalIds, currencies } = query;
        return redisGetSetCacheMiddleware(
            `${RedisKey.goal}${(userIds || []).map((el) => `_${el}`)}${(goalIds || []).map((el) => `_${el}`)}${(currencies || []).map((el) => `_${el}`)}_${page}`,
            async () => {
                const response = await goalServcice.getGoals(query);
                return {
                    code: 200,
                    data: {
                        ...response,
                        data: response.data.map((el) => ({
                            ...el,
                            deadline: el.deadline.toISOString(),
                        })),
                    },
                };
            },
        );
    });
};
const deleteGoal = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteGoalParam }>;
        const goal = await goalServcice.deleteGoal(params.goalId);

        await deleteCache(`${RedisKey.goal}_${goal.userId}`);

        return {
            code: 200,
            data: "Goal was removed",
        };
    });
};
const updateGoal = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateGoalParam;
      Body: updateGoalBody;
    }>;
        const goal = await goalServcice.updateGoal(params.goalId, body);

        await deleteCache(`${RedisKey.goal}_${goal.userId}`);

        return {
            code: 200,
            data: "Goal info was updated",
        };
    });
};
const createGoal = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createGoalBody;
    }>;
        const goal = await goalServcice.createGoal(request.user.id, body);

        await deleteCache(`${RedisKey.goal}_${goal.userId}`);

        return {
            code: 201,
            data: "Goal was created",
        };
    });
};

export const goalHandler = {
    getGoal,
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
};
