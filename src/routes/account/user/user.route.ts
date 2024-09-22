import { FastifyInstance } from "fastify";
import { userHandler } from "./user.handler";
import {
    deleteUserParamSchema,
    getUserParamSchema,
    updateUserBodySchema,
    updateUserParamSchema,
    updateUserPasswordBodySchema,
    updateUserPasswordParamSchema,
    userResponseSchema,
} from "@/business/lib/validation";

export const userRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/:userId",
        {
            schema: {
                response: {
                    200: userResponseSchema,
                },
                tags: ["user"],
                params: getUserParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        userHandler.getUser,
    );
    fastify.put(
        "/:userId",
        {
            schema: {
                tags: ["user"],
                body: updateUserBodySchema,
                params: updateUserParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        function (request, reply) {
            return userHandler.updateUser(request, reply, this.amqp.channel);
        },
    );
    fastify.put(
        "/password/:userId",
        {
            schema: {
                tags: ["user"],
                security: [{ bearerAuth: [] }],
                body: updateUserPasswordBodySchema,
                params: updateUserPasswordParamSchema,
            },
            preHandler: [fastify.authorization],
        },
        function (request, reply) {
            return userHandler.updateUserPassword(request, reply, this.amqp.channel);
        },
    );
    fastify.delete(
        "/:userId",
        {
            schema: {
                tags: ["user"],
                params: deleteUserParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        function (request, reply) {
            return userHandler.deleteUser(request, reply, this.amqp.channel);
        },
    );
};
