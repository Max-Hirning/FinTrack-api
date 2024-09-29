import { prisma } from "@/database/prisma/prisma";
import { currencyService } from "./currency.service";
import { userService } from "./account/user.service";
import { addMonths, format, startOfMonth } from "date-fns";
import {
    accountStatisticParam,
    getStatisticsQueries,
    statisticsGroupedResponse,
    statisticsResponse,
} from "../lib/validation";

const getAccountStatistic = async (param: accountStatisticParam) => {
    const response = {
        loans: 0,
        budget: 0,
        incomes: 0,
        expenses: 0,
        cashflow: 0,
    };
    const startOfCurrentMonth = startOfMonth(new Date());
    const startOfNextMonth = startOfMonth(addMonths(new Date(), 1));

    const user = await userService.find({ id: param.userId });

    const cards = await prisma.card.findMany({
        where: {
            userId: param.userId,
        },
    });
    const loans = await prisma.loan.findMany({
        where: {
            userId: param.userId,
        },
    });
    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                lt: startOfNextMonth,
                gte: startOfCurrentMonth,
            },
            card: {
                userId: param.userId,
            },
        },
        include: {
            card: true,
        },
    });
    const cardCurrencies = cards.map(({ currency }) => currency);
    const currencyRates = await currencyService.getCurrenciesRates({
        base: user.currency,
        symbols: Array.from(new Set(cardCurrencies)),
        end_date: format(startOfNextMonth, "yyyy-MM-dd"),
        start_date: format(startOfCurrentMonth, "yyyy-MM-dd"),
    });

    response.loans = loans.reduce((res, el) => {
        return (res += el.amount);
    }, 0);
    response.budget = cards.reduce((res, el) => {
        return (res += el.balance);
    }, 0);

    for (const transaction of transactions) {
        const date = format(transaction.date, "yyyy-MM-dd");
        if (currencyRates[date]) {
            if (currencyRates[date][transaction.card.currency]) {
                if (transaction.amount > 0) {
                    response.incomes +=
            transaction.amount / currencyRates[date][transaction.card.currency];
                } else {
                    response.expenses +=
            transaction.amount / currencyRates[date][transaction.card.currency];
                }
            }
        }
    }

    response.cashflow = response.incomes - response.expenses;

    return response;
};
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
        if (currencyRates[date]) {
            if (currencyRates[date][transaction.card.currency]) {
                if (response[date]) {
                    if (transaction.amount > 0) {
                        response[date].incomes +=
              transaction.amount /
              currencyRates[date][transaction.card.currency];
                    } else {
                        response[date].expenses +=
              transaction.amount /
              currencyRates[date][transaction.card.currency];
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
        }
    }

    return Object.values(response);
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
        if (currencyRates[date]) {
            if (currencyRates[date][transaction.card.currency]) {
                if (response[transaction.cardId]) {
                    if (transaction.amount < 0) {
                        response[date].value +=
              transaction.amount /
              currencyRates[date][transaction.card.currency];
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
        }
    }

    return Object.values(response);
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
        if (currencyRates[date]) {
            if (currencyRates[date][transaction.card.currency]) {
                if (response[transaction.categoryId]) {
                    if (transaction.amount < 0) {
                        response[date].value +=
              transaction.amount /
              currencyRates[date][transaction.card.currency];
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
        }
    }

    return Object.values(response);
};

export const statisticService = {
    getStatistic,
    getCardsStatistic,
    getAccountStatistic,
    getCategoriesStatistic,
};
