import { statisticService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { getStatisticsQueries } from "@/business/lib/validation";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";

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
        return statisticService.getCardsStatistic(query);
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
        return statisticService.getCategoriesStatistic(query);
    });
};

export const statisticHandler = {
    getStatistic,
    getCardsStatistic,
    getCategoriesStatistic,
};
