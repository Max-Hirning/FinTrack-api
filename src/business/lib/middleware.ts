import { IResponse } from "@/types/api";
import { fastify } from "@/bootstrap/swagger";
import { FastifyError, FastifyReply } from "fastify";

const tryCatchApiMiddleware = async <T>(
    reply: FastifyReply,
    callback: () => Promise<IResponse<T>>,
): Promise<IResponse<T>> => {
    try {
        const { data, code } = await callback();
        return reply.code(code).send(data);
    } catch (error) {
        fastify.log.error((error as Error).message);
        const err = error as FastifyError;
        return reply
            .code(+(err.code || "500") || 500)
            .send(err.message || "Internal server error");
    }
};
const redisGetSetCacheMiddleware = async <T>(
    key: string,
    callback: () => Promise<IResponse<T>>,
    ttl: number = 3600,
): Promise<IResponse<T>> => {
    let cache;

    try {
        cache = await fastify.redis.get(key);
    } catch (error) {
        fastify.log.error((error as Error).message);
    }

    if (cache) {
        return {
            code: 200,
            data: JSON.parse(cache),
        };
    } else {
        const response = await callback();

        try {
            await fastify.redis.set(key, JSON.stringify(response.data), "EX", ttl);
        } catch (error) {
            fastify.log.error((error as Error).message);
        }

        return response;
    }
};

export { tryCatchApiMiddleware, redisGetSetCacheMiddleware };
