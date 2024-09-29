import { statisticService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    accountStatisticParam,
    getStatisticsQueries,
} from "@/business/lib/validation";

const getStatistic = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getStatisticsQueries;
    }>;
        return statisticService.getStatistic(query, request.user.id);
    });
};
const getCardsStatistic = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getStatisticsQueries;
    }>;
        return statisticService.getCardsStatistic(query, request.user.id);
    });
};
const getCategoriesStatistic = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getStatisticsQueries;
    }>;
        return statisticService.getCategoriesStatistic(query, request.user.id);
    });
};
const getAccountStatistic = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: accountStatisticParam;
    }>;
        return statisticService.getAccountStatistic(params);
    });
};

export const statisticHandler = {
    getStatistic,
    getCardsStatistic,
    getAccountStatistic,
    getCategoriesStatistic,
};
