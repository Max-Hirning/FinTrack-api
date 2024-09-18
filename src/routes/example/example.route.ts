import { FastifyInstance } from "fastify";
import { exampleHandler } from "./example.handler";
import {
    exampleQuerySchema,
    exampleResponseSchema,
} from "@/business/lib/validation/example";

export const exampleRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                tags: ["example"],
                summary: "Exempli gratia",
                querystring: exampleQuerySchema,
                response: {
                    200: exampleResponseSchema,
                },
            },
        },
        exampleHandler.get
    );
};
