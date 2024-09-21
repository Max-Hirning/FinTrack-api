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
} from "@/business/lib/validation/account/user";

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
        },
        userHandler.updateUser,
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
        },
        userHandler.updateUserPassword,
    );
    fastify.delete(
        "/:userId",
        {
            schema: {
                tags: ["user"],
                params: deleteUserParamSchema,
                security: [{ bearerAuth: [] }],
            },
        },
        userHandler.deleteUser,
    );
};
