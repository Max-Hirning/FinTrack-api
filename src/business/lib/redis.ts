import { fastify } from "@/bootstrap/swagger";
import { RedisKey } from "@/business/constants";

const deleteCache = async (key: string | RedisKey) => {
    try {
        await fastify.redis.del(key);
    } catch (error) {
        fastify.log.error((error as Error).message);
    }

    let cursor = "0";
    do {
        let result;
        try {
            result = await fastify.redis.scan(cursor, "MATCH", `*${key}*`);
        } catch (error) {
            fastify.log.error((error as Error).message);
        }

        cursor = result ? result[0] : "0";
        const keys = result ? result[1] : [];

        if (keys.length > 0) {
            try {
                await fastify.redis.del(keys);
            } catch (error) {
                fastify.log.error((error as Error).message);
            }
        }
    } while (cursor !== "0");
};

export { deleteCache };
