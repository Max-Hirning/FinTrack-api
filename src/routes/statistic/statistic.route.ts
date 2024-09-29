import { FastifyInstance } from "fastify";
import { statisticHandler } from "./statistic.handler";
import {
    getStatisticsQueriesSchema,
    statisticsListResponseSchema,
    accountStatisticResponseSchema,
    statisticsListGroupedResponseSchema,
    accountStatisticParamSchema,
} from "@/business/lib/validation";

export const statisticRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: statisticsListResponseSchema,
                },
                tags: ["statistic"],
                security: [{ bearerAuth: [] }],
                querystring: getStatisticsQueriesSchema,
            },
            preHandler: [fastify.authorization],
        },
        statisticHandler.getStatistic,
    );
    fastify.get(
        "/account/:userId",
        {
            schema: {
                response: {
                    200: accountStatisticResponseSchema,
                },
                tags: ["statistic"],
                security: [{ bearerAuth: [] }],
                params: accountStatisticParamSchema,
            },
            preHandler: [fastify.authorization],
        },
        statisticHandler.getAccountStatistic,
    );
    fastify.get(
        "/categories",
        {
            schema: {
                response: {
                    200: statisticsListGroupedResponseSchema,
                },
                tags: ["statistic"],
                security: [{ bearerAuth: [] }],
                querystring: getStatisticsQueriesSchema,
            },
            preHandler: [fastify.authorization],
        },
        statisticHandler.getCategoriesStatistic,
    );
    fastify.get(
        "/cards",
        {
            schema: {
                response: {
                    200: statisticsListGroupedResponseSchema,
                },
                tags: ["statistic"],
                security: [{ bearerAuth: [] }],
                querystring: getStatisticsQueriesSchema,
            },
            preHandler: [fastify.authorization],
        },
        statisticHandler.getCardsStatistic,
    );
};
