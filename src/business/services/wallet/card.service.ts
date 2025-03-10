import { deleteCache } from "@/business/lib/redis";
import { currencyService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import {
    cardRepository,
    defaultCardSelect,
    defaultUserSelect,
} from "@/database";
import {
    createCardBody,
    updateCardBody,
    getCardsQueries,
} from "@/business/lib/validation";

const find = async (query: Prisma.CardWhereInput) => {
    const card = await cardRepository.findFirst({
        where: query,
        select: {
            ...defaultCardSelect,
            user: true,
        },
    });
    if (!card) throw new NotFoundError("Card not found");
    return card;
};
const getCards = async (query: getCardsQueries) => {
    const { page, userIds, cardIds, currencies } = query;
    const perPage = 15;
    const params: Prisma.CardWhereInput = {};

    if (cardIds) {
        params.id = {
            in: cardIds,
        };
    }
    if (userIds) {
        params.user = {
            id: {
                in: userIds,
            },
        };
    }
    if (currencies) {
        params.currency = {
            in: currencies,
        };
    }

    if (page) {
        const [total, cards, nextPageExists] = await prisma.$transaction([
            prisma.card.count({
                where: params,
            }),
            prisma.card.findMany({
                orderBy: [
                    {
                        title: "desc",
                    },
                ],
                where: params,
                take: perPage,
                skip: (page - 1) * perPage,
                select: {
                    ...defaultCardSelect,
                    user: {
                        select: {
                            ...defaultUserSelect,
                            images: true,
                        },
                    },
                },
            }),
            prisma.card.findMany({
                take: 1,
                select: {
                    id: true,
                },
                where: params,
                skip: page * perPage,
            }),
        ]);
        return {
            data: cards,
            prevPage: page > 1 ? page - 1 : null,
            totalPages: Math.ceil(total / perPage),
            nextPage: nextPageExists.length > 0 ? page + 1 : null,
        };
    }

    const cards = await cardRepository.findMany({
        orderBy: [
            {
                title: "desc",
            },
        ],
        where: params,
        select: {
            ...defaultCardSelect,
            user: {
                select: {
                    ...defaultUserSelect,
                    images: true,
                },
            },
        },
    });
    return {
        data: cards,
        totalPages: 1,
        prevPage: null,
        nextPage: null,
    };
};
const deleteCard = async (cardId: string) => {
    try {
        const card = await cardRepository.delete({
            where: {
                id: cardId,
            },
        });

        await deleteCache(card.userId);

        return card;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const updateCard = async (cardId: string, payload: updateCardBody) => {
    try {
        const card = await cardRepository.update({
            where: {
                id: cardId,
            },
            data: {
                title: payload.title,
                color: payload.color,
            },
        });

        await deleteCache(card.userId);

        return card;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const createCard = async (userId: string, payload: createCardBody) => {
    currencyService.getCurrency(payload.currency);

    try {
        const card = await cardRepository.create({
            data: {
                userId,
                color: payload.color,
                title: payload.title,
                currency: payload.currency,
                balance: +payload.startBalance.toFixed(2),
                startBalance: +payload.startBalance.toFixed(2),
            },
        });

        await deleteCache(card.userId);

        return card;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};

export const cardServcice = {
    find,
    getCards,
    createCard,
    updateCard,
    deleteCard,
};
