import { FastifyInstance } from "fastify";
import { cardRoutes } from "./wallet/card";
import { authRoutes } from "./account/auth";
import { userRoutes } from "./account/user";
import { currencyRoutes } from "./currency";
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
    await fastify.register(currencyRoutes, {
        prefix: "api/currency",
    });
    await fastify.register(cardRoutes, {
        prefix: "api/card",
    });
};

export { configureRoutes };
