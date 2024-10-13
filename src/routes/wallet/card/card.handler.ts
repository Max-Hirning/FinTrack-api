import { cardServcice } from "@/business/services";
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
        const card = await cardServcice.find({ id: params.cardId });

        return card;
    });
};
const getCards = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getCardsQueries;
    }>;
        return cardServcice.getCards(query);
    });
};
const deleteCard = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteCardParam }>;
        await cardServcice.deleteCard(params.cardId);

        return "Card was removed";
    });
};
const updateCard = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateCardParam;
      Body: updateCardBody;
    }>;
        await cardServcice.updateCard(params.cardId, body);

        return "Card info was updated";
    });
};
const createCard = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createCardBody;
    }>;
        await cardServcice.createCard(request.user.id, body);

        return "Card was created";
    });
};

export const cardHandler = {
    getCard,
    getCards,
    createCard,
    updateCard,
    deleteCard,
};
