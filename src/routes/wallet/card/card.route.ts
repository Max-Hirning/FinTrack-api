import { FastifyInstance } from "fastify";
import { cardHandler } from "./card.handler";
import {
    cardsListResponseSchema,
    createCardBodySchema,
    deleteCardParamSchema,
    getCardsQueriesSchema,
    updateCardBodySchema,
    updateCardParamSchema,
} from "@/business/lib/validation";

export const cardRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: cardsListResponseSchema,
                },
                tags: ["card"],
                security: [{ bearerAuth: [] }],
                querystring: getCardsQueriesSchema,
            },
            preHandler: [fastify.authorization],
        },
        cardHandler.getCards,
    );
    fastify.put(
        "/:cardId",
        {
            schema: {
                tags: ["card"],
                body: updateCardBodySchema,
                params: updateCardParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        cardHandler.updateCard,
    );
    fastify.delete(
        "/:cardId",
        {
            schema: {
                tags: ["card"],
                params: deleteCardParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        cardHandler.deleteCard,
    );
    fastify.post(
        "/",
        {
            schema: {
                tags: ["card"],
                body: createCardBodySchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        cardHandler.createCard,
    );
};
