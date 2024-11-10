import { FastifyReply, FastifyRequest } from "fastify";
import { notificationService } from "@/business/services";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import { getNotificationsQueires } from "@/business/lib/validation";

const getNotifications = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getNotificationsQueires;
    }>;
        const userId = request.user.id;
        return {
            code: 200,
            data: await notificationService.getNotifications(userId, query.page),
        };
    });
};

export const notificationHandler = {
    getNotifications,
};
