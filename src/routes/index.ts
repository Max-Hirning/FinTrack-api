import { FastifyInstance } from "fastify";
import { authRoutes } from "./account/auth";
import { userRoutes } from "./account/user";
import { applicationRoutes } from "./application";

const configureRoutes = async (fastify: FastifyInstance) => {
    await fastify.register(applicationRoutes, {
        prefix: "api",
    });
    await fastify.register(authRoutes, {
        prefix: "api/auth",
    });
    await fastify.register(userRoutes, {
        prefix: "api/user",
    });
};

export { configureRoutes };
