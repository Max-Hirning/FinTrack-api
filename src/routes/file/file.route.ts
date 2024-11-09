import { FastifyInstance } from "fastify";
import { fileHandler } from "./file.handler";

export const fileRoutes = async (fastify: FastifyInstance) => {
    fastify.put(
        "/user",
        {
            schema: {
                tags: ["file"],
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        fileHandler.updateUserAvatar,
    );
    fastify.delete(
        "/user",
        {
            schema: {
                tags: ["file"],
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        fileHandler.deleteUserAvatar,
    );
};
