import { format } from "date-fns";
import { prisma } from "@/database/prisma/prisma";
import { currencyService } from "./currency.service";
import { userService } from "./account/user.service";
import {
    getStatisticsQueries,
    statisticsGroupedResponse,
    statisticsResponse,
} from "../lib/validation";

const getStatistic = async (query: getStatisticsQueries, userId: string) => {
    const { cardIds, userId: categoryUserId, startDate, endDate } = query;
    const user = await userService.find({ id: userId });
    const cardCurrencies = await prisma.card
        .findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                currency: true,
            },
        })
        .then((res) => res.map(({ currency }) => currency));
    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                lte: endDate,
                gte: startDate,
            },
            ...(cardIds && cardIds.length > 0
                ? {
                    cardId: {
                        in: cardIds,
                    },
                }
                : {}),
            ...(categoryUserId
                ? {
                    category: {
                        userId: categoryUserId,
                    },
                }
                : {}),
        },
        include: {
            card: true,
        },
    });

    const currencyRates = await currencyService.getCurrenciesRates({
        end_date: endDate,
        base: user.currency,
        start_date: startDate,
        symbols: Array.from(new Set(cardCurrencies)),
    });

    const response: Record<string, statisticsResponse> = {};
    for (const transaction of transactions) {
        const date = format(transaction.date, "yyyy-MM-dd");
        if (response[date]) {
            if (transaction.amount > 0) {
                response[date].incomes +=
          transaction.amount / currencyRates[date][transaction.card.currency];
            } else {
                response[date].expenses +=
          transaction.amount / currencyRates[date][transaction.card.currency];
            }
        } else {
            response[date] = {
                date,
                incomes:
          transaction.amount > 0
              ? transaction.amount /
              currencyRates[date][transaction.card.currency]
              : 0,
                expenses:
          transaction.amount < 0
              ? transaction.amount /
              currencyRates[date][transaction.card.currency]
              : 0,
            };
        }
    }

    return response;
};
const getCardsStatistic = async (
    query: getStatisticsQueries,
    userId: string,
) => {
    const { cardIds, userId: categoryUserId, startDate, endDate } = query;
    const user = await userService.find({ id: userId });
    const cardCurrencies = await prisma.card
        .findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                currency: true,
            },
        })
        .then((res) => res.map(({ currency }) => currency));
    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                lte: endDate,
                gte: startDate,
            },
            ...(cardIds && cardIds.length > 0
                ? {
                    cardId: {
                        in: cardIds,
                    },
                }
                : {}),
            ...(categoryUserId
                ? {
                    category: {
                        userId: categoryUserId,
                    },
                }
                : {}),
        },
        include: {
            card: true,
        },
    });

    const currencyRates = await currencyService.getCurrenciesRates({
        end_date: endDate,
        base: user.currency,
        start_date: startDate,
        symbols: Array.from(new Set(cardCurrencies)),
    });

    const response: Record<string, statisticsGroupedResponse> = {};
    for (const transaction of transactions) {
        const date = format(transaction.date, "yyyy-MM-dd");
        if (response[transaction.cardId]) {
            if (transaction.amount < 0) {
                response[date].value +=
          transaction.amount / currencyRates[date][transaction.card.currency];
            }
        } else {
            response[transaction.cardId] = {
                fill: transaction.card.color,
                title: transaction.card.title,
                value:
          transaction.amount < 0
              ? transaction.amount /
              currencyRates[date][transaction.card.currency]
              : 0,
            };
        }
    }

    return response;
};
const getCategoriesStatistic = async (
    query: getStatisticsQueries,
    userId: string,
) => {
    const { cardIds, userId: categoryUserId, startDate, endDate } = query;
    const user = await userService.find({ id: userId });
    const cardCurrencies = await prisma.card
        .findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                currency: true,
            },
        })
        .then((res) => res.map(({ currency }) => currency));
    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                lte: endDate,
                gte: startDate,
            },
            ...(cardIds && cardIds.length > 0
                ? {
                    cardId: {
                        in: cardIds,
                    },
                }
                : {}),
            ...(categoryUserId
                ? {
                    category: {
                        userId: categoryUserId,
                    },
                }
                : {}),
        },
        include: {
            card: true,
            category: true,
        },
    });

    const currencyRates = await currencyService.getCurrenciesRates({
        end_date: endDate,
        base: user.currency,
        start_date: startDate,
        symbols: Array.from(new Set(cardCurrencies)),
    });

    const response: Record<string, statisticsGroupedResponse> = {};
    for (const transaction of transactions) {
        const date = format(transaction.date, "yyyy-MM-dd");
        if (response[transaction.categoryId]) {
            if (transaction.amount < 0) {
                response[date].value +=
          transaction.amount / currencyRates[date][transaction.card.currency];
            }
        } else {
            response[transaction.categoryId] = {
                fill: transaction.category.color,
                title: transaction.category.title,
                value:
          transaction.amount < 0
              ? transaction.amount /
              currencyRates[date][transaction.card.currency]
              : 0,
            };
        }
    }

    return response;
};

export const categoryService = {
    getStatistic,
    getCardsStatistic,
    getCategoriesStatistic,
};
