import { FastifyInstance } from "fastify";
import { exampleRoutes } from "./example";
import { applicationRoutes } from "./application";

const configureRoutes = async (fastify: FastifyInstance) => {
    await fastify.register(applicationRoutes, {
        prefix: "api",
    });
    await fastify.register(exampleRoutes, {
        prefix: "api/examples",
    });
};

export { configureRoutes };
