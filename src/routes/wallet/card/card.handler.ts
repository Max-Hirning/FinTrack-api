import { RedisKey } from "@/business/constants";
import { cardServcice } from "@/business/services";
import { deleteCache } from "@/business/lib/redis";
import { FastifyReply, FastifyRequest } from "fastify";
import {
    redisGetSetCacheMiddleware,
    tryCatchApiMiddleware,
} from "@/business/lib/middleware";
import {
    createCardBody,
    deleteCardParam,
    getCardParam,
    getCardsQueries,
    updateCardBody,
    updateCardParam,
} from "@/business/lib/validation";

const getCard = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: getCardParam;
    }>;
        const { cardId } = params;
        return redisGetSetCacheMiddleware(
            `${RedisKey.card}_${cardId}`,
            async () => {
                return {
                    code: 200,
                    data: cardServcice.find({ id: params.cardId }),
                };
            },
        );
    });
};
const getCards = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getCardsQueries;
    }>;
        const { page, userIds, cardIds, currencies } = query;
        return redisGetSetCacheMiddleware(
            `${RedisKey.card}${(userIds || []).map((el) => `_${el}`)}${(cardIds || []).map((el) => `_${el}`)}${(currencies || []).map((el) => `_${el}`)}_${page}`,
            async () => {
                return {
                    code: 200,
                    data: cardServcice.getCards(query),
                };
            },
        );
    });
};
const deleteCard = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteCardParam }>;
        await cardServcice.deleteCard(params.cardId);

        await deleteCache(RedisKey.card);
        await deleteCache(RedisKey.goal);
        await deleteCache(RedisKey.loan);
        await deleteCache(RedisKey.budget);
        await deleteCache(RedisKey.statistic);
        await deleteCache(RedisKey.transaction);

        return {
            code: 200,
            data: "Card was removed",
        };
    });
};
const updateCard = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateCardParam;
      Body: updateCardBody;
    }>;
        await cardServcice.updateCard(params.cardId, body);

        await deleteCache(RedisKey.card);
        await deleteCache(RedisKey.goal);
        await deleteCache(RedisKey.loan);
        await deleteCache(RedisKey.budget);
        await deleteCache(RedisKey.statistic);
        await deleteCache(RedisKey.transaction);

        return {
            code: 200,
            data: "Card info was updated",
        };
    });
};
const createCard = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createCardBody;
    }>;
        await cardServcice.createCard(request.user.id, body);

        await deleteCache(RedisKey.card);
        await deleteCache(RedisKey.goal);
        await deleteCache(RedisKey.loan);
        await deleteCache(RedisKey.budget);
        await deleteCache(RedisKey.statistic);
        await deleteCache(RedisKey.transaction);

        return {
            code: 201,
            data: "Card was created",
        };
    });
};

export const cardHandler = {
    getCard,
    getCards,
    createCard,
    updateCard,
    deleteCard,
};
