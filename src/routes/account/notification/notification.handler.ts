import { RedisKey } from "@/business/constants";
import { FastifyReply, FastifyRequest } from "fastify";
import { notificationService } from "@/business/services";
import { getNotificationsQueires } from "@/business/lib/validation";
import {
    redisGetSetCacheMiddleware,
    tryCatchApiMiddleware,
} from "@/business/lib/middleware";

const getNotifications = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getNotificationsQueires;
    }>;
        const userId = request.user.id;
        const { page } = query;
        return redisGetSetCacheMiddleware(
            `${RedisKey.notification}_${userId}_${page}`,
            async () => {
                return {
                    code: 200,
                    data: notificationService.getNotifications(userId, query.page),
                };
            },
        );
    });
};

export const notificationHandler = {
    getNotifications,
};
