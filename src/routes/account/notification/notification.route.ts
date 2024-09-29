import { FastifyInstance } from "fastify";
import { notificationHandler } from "./notification.handler";
import {
    getNotificationsQueiresSchema,
    notificationListResponseSchema,
} from "@/business/lib/validation";

export const notificationRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: notificationListResponseSchema,
                },
                tags: ["notification"],
                security: [{ bearerAuth: [] }],
                querystring: getNotificationsQueiresSchema,
            },
            preHandler: [fastify.authorization],
        },
        notificationHandler.getNotifications,
    );
};
