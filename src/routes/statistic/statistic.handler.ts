import { RedisKey } from "@/business/constants";
import { statisticService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import {
    accountStatisticParam,
    getStatisticsQueries,
} from "@/business/lib/validation";
import {
    redisGetSetCacheMiddleware,
    tryCatchApiMiddleware,
} from "@/business/lib/middleware";

const getStatistic = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getStatisticsQueries;
    }>;
        const { endDate, startDate, cardIds, userId } = query;
        return redisGetSetCacheMiddleware(
            `${RedisKey.statistic}_${userId}${(cardIds || []).map((el) => `_${el}`)}_${endDate}_${startDate}`,
            async () => {
                return {
                    code: 200,
                    data: await statisticService.getStatistic(query, request.user.id),
                };
            },
        );
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
        // const { endDate, startDate, cardIds, userId } = query;
        // return redisGetSetCacheMiddleware(
        //     `${RedisKey.statistic}_card_${userId}${(cardIds || []).map((el) => `_${el}`)}_${endDate}_${startDate}`,
        //     async () => {
        return {
            code: 200,
            data: await statisticService.getCardsStatistic(query, request.user.id),
        };
    //     },
    // );
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
        const { endDate, startDate, cardIds, userId } = query;
        return redisGetSetCacheMiddleware(
            `${RedisKey.statistic}_category_${userId}${(cardIds || []).map((el) => `_${el}`)}_${endDate}_${startDate}`,
            async () => {
                return {
                    code: 200,
                    data: await statisticService.getCategoriesStatistic(
                        query,
                        request.user.id,
                    ),
                };
            },
        );
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
        const { userId } = params;
        return redisGetSetCacheMiddleware(
            `${RedisKey.statistic}_account_${userId}`,
            async () => {
                return {
                    code: 200,
                    data: await statisticService.getAccountStatistic(params),
                };
            },
        );
    });
};

export const statisticHandler = {
    getStatistic,
    getCardsStatistic,
    getAccountStatistic,
    getCategoriesStatistic,
};
