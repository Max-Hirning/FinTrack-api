import { Statuses } from "@prisma/client";
import { deleteCache } from "../lib/redis";
import { goalServcice } from "./wallet/goal.service";
import { loanServcice } from "./wallet/loan.service";
import { currencyService } from "./currency.service";
import { cardServcice } from "./wallet/card.service";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import {
    createTransactionBody,
    getTransactionsQueries,
    updateTransactionBody,
} from "@/business/lib/validation";
import {
    budgetRepository,
    cardRepository,
    goalRepository,
    loanRepository,
    transactionRepository,
} from "@/database";

const deleteTransaction = async (transactionId: string) => {
    let transaction;

    try {
        transaction = await transactionRepository.delete({
            where: {
                id: transactionId,
            },
            include: {
                card: true,
                loan: true,
                goal: true,
            },
        });
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    try {
        const card = await cardServcice.find({ id: transaction.cardId });
        const updatedCardBalance = +(
            card.balance +
      -1 * transaction.amount
        ).toFixed(2);
        await cardRepository.update({
            where: {
                id: transaction.cardId,
            },
            data: {
                balance: updatedCardBalance,
            },
        });
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    try {
        const budgets = await budgetRepository.findMany({
            where: {
                startDate: {
                    lte: transaction.date,
                },
                endDate: {
                    gt: transaction.date,
                },
                categories: {
                    some: {
                        id: transaction.categoryId,
                    },
                },
                cards: {
                    some: {
                        id: transaction.cardId,
                    },
                },
            },
        });

        const currenciesRates = await currencyService.getCurrentCurrenciesRates({
            base: transaction.card.currency,
            symbols: Array.from(new Set(budgets.map(({ currency }) => currency))),
        });

        for (const budget of budgets) {
            let tarnsactionAmount = transaction.amount;
            if (budget.currency !== transaction.card.currency) {
                tarnsactionAmount =
          transaction.amount *
          (currenciesRates[transaction.card.currency] || 1);
            }
            const updatedBudgetBalance = +(
                budget.amount +
        -1 * tarnsactionAmount
            ).toFixed(2);
            try {
                await budgetRepository.update({
                    where: {
                        id: budget.id,
                    },
                    data: {
                        amount: updatedBudgetBalance,
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }

    if (transaction.goalId) {
        try {
            let goalAmount = transaction.amount;
            const goal = await goalServcice.find({ id: transaction.goalId });
            if (goal.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: goal.currency,
                    symbols: [transaction.card.currency],
                });
                goalAmount =
          goalAmount * (currencyRate[transaction.card.currency] || 1);
            }
            const updatedGoalBalance = +(goal.balance + -1 * goalAmount).toFixed(2);
            await goalRepository.update({
                where: {
                    id: transaction.goalId,
                },
                data: {
                    ...(updatedGoalBalance >= goalAmount
                        ? {
                            status: Statuses.closed,
                        }
                        : {}),
                    balance: updatedGoalBalance,
                },
            });
        } catch (error) {
            console.log(error);
        }
    }

    if (transaction.loanId) {
        try {
            let loanAmount = transaction.amount;
            const loan = await loanServcice.find({ id: transaction.loanId });
            if (loan.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: loan.currency,
                    symbols: [transaction.card.currency],
                });
                loanAmount =
          loanAmount * (currencyRate[transaction.card.currency] || 1);
            }
            const updatedLoanBalance = +(loan.balance + -1 * loanAmount).toFixed(2);
            await loanRepository.update({
                where: {
                    id: transaction.loanId,
                },
                data: {
                    ...(updatedLoanBalance >= loanAmount
                        ? {
                            status: Statuses.closed,
                        }
                        : {}),
                    balance: updatedLoanBalance,
                },
            });
        } catch (error) {
            console.log(error);
        }
    }

    await deleteCache(transaction.card.userId);

    return transaction;
};
const find = async (query: Prisma.TransactionWhereInput) => {
    const transaction = await transactionRepository.findFirst({
        where: query,
        include: {
            category: true,
            card: true,
            loan: true,
            goal: true,
        },
    });
    if (!transaction) throw new NotFoundError("No transaction found");
    return transaction;
};
const getTransactions = async (query: getTransactionsQueries) => {
    const {
        page,
        userIds,
        transactionIds,
        currencies,
        budgetIds,
        cardIds,
        goalIds,
        loanIds,
    } = query;
    const perPage = 15;
    const params: Prisma.TransactionWhereInput = {
        ...(userIds && { card: { userId: { in: userIds } } }),
        ...(budgetIds && {
            card: { budgets: { some: { id: { in: budgetIds } } } },
        }),
        ...(cardIds && { cardId: { in: cardIds } }),
        ...(goalIds && { goalId: { in: goalIds } }),
        ...(loanIds && { loanId: { in: loanIds } }),
        ...(currencies && { card: { currency: { in: currencies } } }),
        ...(transactionIds && { id: { in: transactionIds } }),
    };

    if (page) {
        const [total, transactions, nextPageExists] = await prisma.$transaction([
            prisma.transaction.count({
                where: params,
            }),
            prisma.transaction.findMany({
                orderBy: [
                    {
                        date: "desc",
                    },
                ],
                where: params,
                take: perPage,
                skip: (page - 1) * perPage,
                include: {
                    category: true,
                    card: true,
                    loan: true,
                    goal: true,
                },
            }),
            prisma.transaction.findMany({
                take: 1,
                select: {
                    id: true,
                },
                where: params,
                skip: page * perPage,
            }),
        ]);
        return {
            data: transactions,
            prevPage: page > 1 ? page - 1 : null,
            totalPages: Math.ceil(total / perPage),
            nextPage: nextPageExists.length > 0 ? page + 1 : null,
        };
    }

    const transactions = await transactionRepository.findMany({
        orderBy: [
            {
                date: "desc",
            },
        ],
        where: params,
        include: {
            category: true,
            card: true,
            loan: true,
            goal: true,
        },
    });

    return {
        data: transactions,
        totalPages: 1,
        prevPage: null,
        nextPage: null,
    };
};
const createTransaction = async (payload: createTransactionBody) => {
    let transaction;
    try {
        transaction = await transactionRepository.create({
            data: {
                date: payload.date,
                amount: payload.amount,
                cardId: payload.cardId,
                goalId: payload.goalId,
                loanId: payload.loanId,
                categoryId: payload.categoryId,
                description: payload.description || "",
            },
            include: {
                card: true,
                loan: true,
                goal: true,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }

    try {
        const card = await cardServcice.find({ id: payload.cardId });
        await cardRepository.update({
            where: {
                id: payload.cardId,
            },
            data: {
                balance: +(card.balance + payload.amount).toFixed(2),
            },
        });
    } catch (error) {
        console.log(error);
    }

    try {
        const budgets = await budgetRepository.findMany({
            where: {
                startDate: {
                    lte: transaction.date,
                },
                endDate: {
                    gt: transaction.date,
                },
                categories: {
                    some: {
                        id: transaction.categoryId,
                    },
                },
                cards: {
                    some: {
                        id: transaction.cardId,
                    },
                },
            },
        });

        const currenciesRates = await currencyService.getCurrentCurrenciesRates({
            base: transaction.card.currency,
            symbols: Array.from(new Set(budgets.map(({ currency }) => currency))),
        });

        for (const budget of budgets) {
            let tarnsactionAmount = transaction.amount;
            if (budget.currency !== transaction.card.currency) {
                tarnsactionAmount =
          transaction.amount *
          (currenciesRates[transaction.card.currency] || 1);
            }
            try {
                await budgetRepository.update({
                    where: {
                        id: budget.id,
                    },
                    data: {
                        amount: +(budget.amount + tarnsactionAmount).toFixed(2),
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }

    if (payload.goalId) {
        try {
            let goalAmount = Math.abs(transaction.amount);
            const goal = await goalServcice.find({ id: payload.goalId });
            if (goal.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: goal.currency,
                    symbols: [transaction.card.currency],
                });
                goalAmount =
          goalAmount * (currencyRate[transaction.card.currency] || 1);
            }
            const updatedGoalBalance = +(goal.balance + goalAmount).toFixed(2);
            await transactionRepository.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    goalAmount,
                },
            });
            await goalRepository.update({
                where: {
                    id: payload.goalId,
                },
                data: {
                    ...(updatedGoalBalance >= goalAmount
                        ? {
                            status: Statuses.closed,
                        }
                        : {}),
                    balance: updatedGoalBalance,
                },
            });
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }

    if (payload.loanId) {
        try {
            let loanAmount = Math.abs(transaction.amount);
            const loan = await loanServcice.find({ id: payload.loanId });
            if (loan.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: loan.currency,
                    symbols: [transaction.card.currency],
                });
                loanAmount =
          loanAmount * (currencyRate[transaction.card.currency] || 1);
            }
            const updatedLoanBalance = +(loan.balance + loanAmount).toFixed(2);
            await transactionRepository.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    loanAmount,
                },
            });
            await loanRepository.update({
                where: {
                    id: payload.loanId,
                },
                data: {
                    ...(updatedLoanBalance >= loanAmount
                        ? {
                            status: Statuses.closed,
                        }
                        : {}),
                    balance: updatedLoanBalance,
                },
            });
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }

    await deleteCache(transaction.card.userId);

    return transaction;
};
const updateTransaction = async (
    transactionId: string,
    payload: updateTransactionBody,
) => {
    let transaction;

    try {
        transaction = await transactionRepository.update({
            where: {
                id: transactionId,
            },
            data: {
                categoryId: payload.categoryId,
                description: payload.description || "",
            },
            include: {
                card: true,
                loan: true,
                goal: true,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }

    await deleteCache(transaction.card.userId);

    return transaction;
};

export const transactionServcice = {
    find,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
