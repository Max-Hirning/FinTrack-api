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
        return notificationService.getNotifications(request.user.id, query.page);
    });
};

export const notificationHandler = {
    getNotifications,
};
