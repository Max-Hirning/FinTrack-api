import { Statuses } from "@prisma/client";
import { deleteCache } from "../lib/redis";
import { currencyService } from "./currency.service";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import { defaultTransactionSelect, transactionRepository } from "@/database";
import {
    createTransactionBody,
    getTransactionsQueries,
    updateTransactionBody,
} from "@/business/lib/validation";

const deleteTransaction = async (transactionId: string) => {
    return await prisma.$transaction(async (prisma) => {
    // Step 1: Delete the Transaction
        const transaction = await prisma.transaction.delete({
            where: {
                id: transactionId,
            },
            select: {
                ...defaultTransactionSelect,
                card: true,
                loan: true,
                goal: true,
            },
        });

        await prisma.card.update({
            where: {
                id: transaction.cardId,
            },
            data: {
                balance: {
                    increment: -1 * transaction.amount,
                },
            },
        });

        // Step 3: Update Budgets
        const budgets = await prisma.budget.findMany({
            where: {
                startDate: { lte: transaction.date },
                endDate: { gt: transaction.date },
                categories: { some: { id: transaction.categoryId } },
                cards: { some: { id: transaction.cardId } },
            },
        });

        const currenciesRates = await currencyService.getCurrentCurrenciesRates({
            base: transaction.card.currency,
            symbols: Array.from(new Set(budgets.map(({ currency }) => currency))),
        });

        for (const budget of budgets) {
            let transactionAmount = transaction.amount;
            if (budget.currency !== transaction.card.currency) {
                transactionAmount =
          transaction.amount *
          (currenciesRates[transaction.card.currency] || 1);
            }

            const updatedBudgetBalance = +(budget.amount - transactionAmount).toFixed(
                2,
            );

            await prisma.budget.update({
                where: { id: budget.id },
                data: { amount: updatedBudgetBalance },
            });
        }

        // Step 4: Update Goal (if applicable)
        if (transaction.goalId) {
            const goal = await prisma.goal.findUniqueOrThrow({
                where: { id: transaction.goalId },
            });

            let goalAmount = transaction.amount;
            if (goal.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: goal.currency,
                    symbols: [transaction.card.currency],
                });
                goalAmount =
          goalAmount * (currencyRate[transaction.card.currency] || 1);
            }

            const updatedGoalBalance = +(goal.balance - goalAmount).toFixed(2);
            await prisma.goal.update({
                where: { id: transaction.goalId },
                data: {
                    ...(updatedGoalBalance >= goal.amount
                        ? { status: Statuses.closed }
                        : {}),
                    balance: updatedGoalBalance,
                },
            });
        }

        // Step 5: Update Loan (if applicable)
        if (transaction.loanId) {
            const loan = await prisma.loan.findUniqueOrThrow({
                where: { id: transaction.loanId },
            });

            let loanAmount = transaction.amount;
            if (loan.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: loan.currency,
                    symbols: [transaction.card.currency],
                });
                loanAmount =
          loanAmount * (currencyRate[transaction.card.currency] || 1);
            }

            const updatedLoanBalance = +(loan.balance - loanAmount).toFixed(2);
            await prisma.loan.update({
                where: { id: transaction.loanId },
                data: {
                    ...(updatedLoanBalance >= loan.amount
                        ? { status: Statuses.closed }
                        : {}),
                    balance: updatedLoanBalance,
                },
            });
        }

        // Step 6: Delete Cache
        await deleteCache(transaction.card.userId);

        return transaction;
    });
};

const find = async (query: Prisma.TransactionWhereInput) => {
    const transaction = await transactionRepository.findFirst({
        where: query,
        select: {
            ...defaultTransactionSelect,
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
                select: {
                    ...defaultTransactionSelect,
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
        select: {
            ...defaultTransactionSelect,
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
    return await prisma.$transaction(async (prisma) => {
    // Step 1: Create Transaction
        const transaction = await prisma.transaction.create({
            data: {
                date: payload.date,
                amount: payload.amount,
                cardId: payload.cardId,
                goalId: payload.goalId,
                loanId: payload.loanId,
                categoryId: payload.categoryId,
                description: payload.description || "",
            },
            select: {
                ...defaultTransactionSelect,
                card: true,
                loan: true,
                goal: true,
            },
        });

        await prisma.card.update({
            where: { id: payload.cardId },
            data: { balance: { increment: payload.amount } },
        });

        // Step 3: Update Budgets
        const budgets = await prisma.budget.findMany({
            where: {
                startDate: { lte: transaction.date },
                endDate: { gt: transaction.date },
                categories: { some: { id: transaction.categoryId } },
                cards: { some: { id: transaction.cardId } },
            },
        });

        const currenciesRates = await currencyService.getCurrentCurrenciesRates({
            base: transaction.card.currency,
            symbols: Array.from(new Set(budgets.map(({ currency }) => currency))),
        });

        for (const budget of budgets) {
            let transactionAmount = transaction.amount;
            if (budget.currency !== transaction.card.currency) {
                transactionAmount =
          transaction.amount *
          (currenciesRates[transaction.card.currency] || 1);
            }

            await prisma.budget.update({
                where: { id: budget.id },
                data: { amount: { increment: transactionAmount } },
            });
        }

        // Step 4: Update Goal (if applicable)
        if (payload.goalId) {
            const goal = await prisma.goal.findUniqueOrThrow({
                where: { id: payload.goalId },
            });

            let goalAmount = Math.abs(transaction.amount);
            if (goal.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: goal.currency,
                    symbols: [transaction.card.currency],
                });
                goalAmount =
          goalAmount * (currencyRate[transaction.card.currency] || 1);
            }

            const updatedGoalBalance = +(goal.balance + goalAmount).toFixed(2);
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { goalAmount },
            });

            await prisma.goal.update({
                where: { id: payload.goalId },
                data: {
                    ...(updatedGoalBalance >= goal.amount
                        ? { status: Statuses.closed }
                        : {}),
                    balance: updatedGoalBalance,
                },
            });
        }

        // Step 5: Update Loan (if applicable)
        if (payload.loanId) {
            const loan = await prisma.loan.findUniqueOrThrow({
                where: { id: payload.loanId },
            });

            let loanAmount = Math.abs(transaction.amount);
            if (loan.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: loan.currency,
                    symbols: [transaction.card.currency],
                });
                loanAmount =
          loanAmount * (currencyRate[transaction.card.currency] || 1);
            }

            const updatedLoanBalance = +(loan.balance + loanAmount).toFixed(2);
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { loanAmount },
            });

            await prisma.loan.update({
                where: { id: payload.loanId },
                data: {
                    ...(updatedLoanBalance >= loan.amount
                        ? { status: Statuses.closed }
                        : {}),
                    balance: updatedLoanBalance,
                },
            });
        }

        // Step 6: Delete Cache
        await deleteCache(transaction.card.userId);

        return transaction;
    });
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
            select: {
                ...defaultTransactionSelect,
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
