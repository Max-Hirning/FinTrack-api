import { FastifyInstance } from "fastify";
import { currencyHandler } from "./currency.handler";
import { currenciesListResponseSchema } from "@/business/lib/validation/currency";

export const currencyRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: currenciesListResponseSchema,
                },
                tags: ["currency"],
            },
        },
        currencyHandler.getCurrencies,
    );
};
