import { currencyService } from "./currency.service";
import { userService } from "./account/user.service";
import {
    cardRepository,
    loanRepository,
    transactionRepository,
} from "@/database";
import {
    addDays,
    addMonths,
    addYears,
    format,
    setDate,
    setMonth,
    startOfMonth,
} from "date-fns";
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

    const cards = await cardRepository.findMany({
        where: {
            userId: param.userId,
        },
    });
    const loans = await loanRepository.findMany({
        where: {
            userId: param.userId,
        },
    });
    const transactions = await transactionRepository.findMany({
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
    const currencyRates = await currencyService.getCurrentCurrenciesRates({
        base: user.currency,
        symbols: Array.from(new Set(cardCurrencies)),
    });

    response.loans = loans.reduce((res, el) => {
        if (currencyRates[el.currency]) {
            res += el.amount / currencyRates[el.currency];
        }
        return res;
    }, 0);
    response.budget = cards.reduce((res, el) => {
        if (currencyRates[el.currency]) {
            res += el.balance / currencyRates[el.currency];
        }
        return res;
    }, 0);

    for (const transaction of transactions) {
    // const date = format(transaction.date, "yyyy-MM-dd");
    // if (currencyRates[date]) {
        if (currencyRates[transaction.card.currency]) {
            if (transaction.amount > 0) {
                response.incomes +=
          transaction.amount / currencyRates[transaction.card.currency];
            } else {
                response.expenses +=
          transaction.amount / currencyRates[transaction.card.currency];
            }
        }
    // }
    }

    response.cashflow = Math.abs(response.incomes) - Math.abs(response.expenses);

    return {
        loans: Math.abs(response.loans),
        budget: Math.abs(response.budget),
        incomes: Math.abs(response.incomes),
        expenses: Math.abs(response.expenses),
        cashflow: Math.abs(response.cashflow),
    };
};
const statisticTemplate = (
    payload: Pick<getStatisticsQueries, "endDate" | "startDate" | "frequency">,
) => {
    const { startDate, endDate, frequency } = payload;
    const end = new Date(endDate);
    const start = new Date(startDate);

    const result: Record<string, statisticsResponse> = {};

    let currentDate = start;

    while (currentDate <= end) {
        let key: string;

        switch (frequency) {
        case "year":
            key = format(currentDate, "yyyy-MM-dd");
            currentDate = addYears(currentDate, 1);
            break;
        case "month":
            key = format(currentDate, "yyyy-MM-dd");
            currentDate = addMonths(currentDate, 1);
            break;
        case "day":
            key = format(currentDate, "yyyy-MM-dd");
            currentDate = addDays(currentDate, 1);
            break;
        default:
            throw new Error("Invalid frequency");
        }

        result[key] = { date: key, incomes: 0, expenses: 0 };
    }

    return result;
};
const getStatistic = async (query: getStatisticsQueries, userId: string) => {
    const {
        userId: categoryUserId,
        cardIds,
        startDate,
        endDate,
        goalIds,
        loanIds,
        budgetIds,
        frequency = "day",
    } = query;

    const user = await userService.find({ id: userId });
    const cardCurrencies = await cardRepository
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
    const transactions = await transactionRepository.findMany({
        where: {
            date: {
                lte: new Date(endDate),
                gte: new Date(startDate),
            },
            ...(cardIds && cardIds.length > 0
                ? {
                    cardId: {
                        in: cardIds,
                    },
                }
                : {}),
            ...(loanIds && loanIds.length > 0
                ? {
                    loanId: {
                        in: loanIds,
                    },
                }
                : {}),
            ...(goalIds && goalIds.length > 0
                ? {
                    goalId: {
                        in: goalIds,
                    },
                }
                : {}),
            ...(budgetIds && budgetIds.length > 0
                ? {
                    budgetId: {
                        in: budgetIds,
                    },
                }
                : {}),
            ...(!(cardIds && loanIds && goalIds && budgetIds)
                ? {
                    OR: [
                        {
                            card: {
                                userId,
                            },
                        },
                        {
                            loan: {
                                userId,
                            },
                        },
                        {
                            goal: {
                                userId,
                            },
                        },
                    ],
                }
                : {}),
            ...(categoryUserId
                ? {
                    category: {
                        OR: [
                            {
                                userId: categoryUserId,
                            },
                            {
                                userId: null,
                            },
                        ],
                    },
                }
                : {}),
        },
        include: {
            card: true,
        },
    });

    const currencyRates = await currencyService.getCurrentCurrenciesRates({
        base: user.currency,
        symbols: Array.from(new Set(cardCurrencies)),
    });

    const response = statisticTemplate({ startDate, endDate, frequency });
    for (const transaction of transactions) {
        let date = format(transaction.date, "yyyy-MM-dd");
        if (frequency === "month") {
            date = format(setDate(transaction.date, 1), "yyyy-MM-dd");
        }
        if (frequency === "year") {
            date = format(setMonth(setDate(transaction.date, 1), 0), "yyyy-MM-dd");
        }
        if (response[date]) {
            if (transaction.amount > 0) {
                response[date].incomes +=
          transaction.amount / currencyRates[transaction.card.currency];
            } else {
                response[date].expenses +=
          transaction.amount / currencyRates[transaction.card.currency];
            }
        } else {
            response[date] = {
                date,
                incomes:
          transaction.amount > 0
              ? transaction.amount / currencyRates[transaction.card.currency]
              : 0,
                expenses:
          transaction.amount < 0
              ? transaction.amount / currencyRates[transaction.card.currency]
              : 0,
            };
        }
    }

    return Object.values(response).map((el) => ({
        ...el,
        incomes: Math.abs(el.incomes),
        expenses: Math.abs(el.expenses),
    }));
};
const getCardsStatistic = async (
    query: getStatisticsQueries,
    userId: string,
) => {
    const { cardIds, userId: categoryUserId, startDate, endDate } = query;
    const user = await userService.find({ id: userId });
    const cardCurrencies = await cardRepository
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
    const transactions = await transactionRepository.findMany({
        where: {
            date: {
                lte: new Date(endDate),
                gte: new Date(startDate),
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
                        OR: [
                            {
                                userId: categoryUserId,
                            },
                            {
                                userId: null,
                            },
                        ],
                    },
                }
                : {}),
        },
        include: {
            card: true,
        },
    });

    const currencyRates = await currencyService.getCurrentCurrenciesRates({
        base: user.currency,
        symbols: Array.from(new Set(cardCurrencies)),
    });

    const response: Record<string, statisticsGroupedResponse> = {};
    for (const transaction of transactions) {
        if (currencyRates[transaction.card.currency]) {
            if (response[transaction.cardId]) {
                if (transaction.amount < 0) {
                    response[transaction.cardId].value +=
            transaction.amount / currencyRates[transaction.card.currency];
                }
            } else {
                response[transaction.cardId] = {
                    fill: transaction.card.color,
                    title: transaction.card.title,
                    value:
            transaction.amount < 0
                ? transaction.amount / currencyRates[transaction.card.currency]
                : 0,
                };
            }
        }
    }

    return Object.values(response).map((el) => ({
        ...el,
        value: Math.abs(el.value),
    }));
};
const getCategoriesStatistic = async (
    query: getStatisticsQueries,
    userId: string,
) => {
    const { cardIds, userId: categoryUserId, startDate, endDate } = query;
    const user = await userService.find({ id: userId });
    const cardCurrencies = await cardRepository
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
    const transactions = await transactionRepository.findMany({
        where: {
            date: {
                lte: new Date(endDate),
                gte: new Date(startDate),
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
                        OR: [
                            {
                                userId: categoryUserId,
                            },
                            {
                                userId: null,
                            },
                        ],
                    },
                }
                : {}),
        },
        include: {
            card: true,
            category: true,
        },
    });

    const currencyRates = await currencyService.getCurrentCurrenciesRates({
        base: user.currency,
        symbols: Array.from(new Set(cardCurrencies)),
    });

    const response: Record<string, statisticsGroupedResponse> = {};
    for (const transaction of transactions) {
        if (currencyRates[transaction.card.currency]) {
            if (response[transaction.categoryId]) {
                if (transaction.amount < 0) {
                    response[transaction.categoryId].value +=
            transaction.amount / currencyRates[transaction.card.currency];
                }
            } else {
                response[transaction.categoryId] = {
                    fill: transaction.category.color,
                    title: transaction.category.title,
                    value:
            transaction.amount < 0
                ? transaction.amount / currencyRates[transaction.card.currency]
                : 0,
                };
            }
        }
    }

    return Object.values(response).map((el) => ({
        ...el,
        value: Math.abs(el.value),
    }));
};

export const statisticService = {
    getStatistic,
    getCardsStatistic,
    getAccountStatistic,
    getCategoriesStatistic,
};
