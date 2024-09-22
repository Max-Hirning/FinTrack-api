import { currencyService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";

const getCurrencies = async (_: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        return currencyService.getCurrencies();
    });
};

export const currencyHandler = {
    getCurrencies,
};
