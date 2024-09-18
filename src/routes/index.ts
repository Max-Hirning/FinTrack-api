import { FastifyInstance } from "fastify";
import { authRoutes } from "./account/auth";
import { applicationRoutes } from "./application";

const configureRoutes = async (fastify: FastifyInstance) => {
    await fastify.register(applicationRoutes, {
        prefix: "api",
    });
    await fastify.register(authRoutes, {
        prefix: "api/auth",
    });
};

export { configureRoutes };
