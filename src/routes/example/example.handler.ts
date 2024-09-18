import { FastifyReply, FastifyRequest } from "fastify";
import { exampleService } from "@/business/services/example";
import { ExampleQuery } from "@/business/lib/validation/example";

const get = async (
    request: FastifyRequest<{
        Querystring: ExampleQuery;
    }>,
    reply: FastifyReply
) => {
    const { query } = request;

    const message = exampleService.getExample();

    return reply.send({
        message: message + (query.info || ""),
    });
};

export const exampleHandler = { get };
