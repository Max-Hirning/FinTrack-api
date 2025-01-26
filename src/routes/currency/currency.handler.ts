import { currencyService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import { currenciesListResponse } from "@/business/lib/validation";

const getCurrencies = async (_: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware<currenciesListResponse>(reply, async () => {
        return {
            code: 200,
            data: currencyService.getCurrencies(),
        };
    });
};

export const currencyHandler = {
    getCurrencies,
};
