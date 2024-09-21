import { FastifyError, FastifyReply } from "fastify";

const tryCatchApiMiddleware = async (
    reply: FastifyReply,
    callback: () => Promise<unknown>,
) => {
    try {
        const message = await callback();
        return reply.code(200).send(message);
    } catch (error) {
        console.log(error);
        const err = error as FastifyError;
        return reply
            .code(+(err.code || "500") || 500)
            .send(err.message || "Internal server error");
    }
};

export { tryCatchApiMiddleware };
