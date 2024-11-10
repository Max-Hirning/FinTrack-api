import { RedisKey } from "@/business/constants";
import { cardServcice } from "@/business/services";
import { deleteCache } from "@/business/lib/redis";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
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
        return {
            code: 200,
            data: await cardServcice.find({ id: params.cardId }),
        };
    });
};
const getCards = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getCardsQueries;
    }>;
        return {
            code: 200,
            data: await cardServcice.getCards(query),
        };
    });
};
const deleteCard = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteCardParam }>;
        await cardServcice.deleteCard(params.cardId);

        await deleteCache(RedisKey.statistic);

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

        await deleteCache(RedisKey.statistic);

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

        await deleteCache(RedisKey.statistic);

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
