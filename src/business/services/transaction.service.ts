import { environmentVariables } from "@/config";
import { goalServcice } from "./wallet/goal.service";
import { loanServcice } from "./wallet/loan.service";
import { currencyService } from "./currency.service";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import {
    createTransactionBody,
    getTransactionsQueries,
    updateTransactionBody,
} from "@/business/lib/validation";

const deleteTransaction = async (transactionId: string) => {
    let transaction;

    try {
        transaction = await prisma.transaction.delete({
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
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    try {
        const budgets = await prisma.budget.findMany({
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
                await prisma.budget.update({
                    where: {
                        id: budget.id,
                    },
                    data: {
                        amount: {
                            increment: -1 * tarnsactionAmount,
                        },
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
            await prisma.goal.update({
                where: {
                    id: transaction.goalId,
                },
                data: {
                    balance: {
                        increment: -1 * goalAmount,
                    },
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
            await prisma.loan.update({
                where: {
                    id: transaction.loanId,
                },
                data: {
                    balance: {
                        increment: -1 * loanAmount,
                    },
                },
            });
        } catch (error) {
            console.log(error);
        }
    }

    return transaction;
};
const find = async (query: Prisma.TransactionWhereInput) => {
    try {
        const transaction = await prisma.transaction.findFirstOrThrow({
            where: query,
            include: {
                category: true,
                card: true,
                loan: true,
                goal: true,
            },
        });
        return {
            ...transaction,
            category: {
                ...transaction.category,
                image: `${environmentVariables.API_URL}/assets/category/${transaction.category.image}.svg`,
            },
        };
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
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
            data: transactions.map((el) => ({
                ...el,
                ...{
                    ...el.category,
                    image: `${environmentVariables.API_URL}/assets/category/${el.category.image}.svg`,
                },
            })),
            prevPage: page > 1 ? page - 1 : null,
            totalPages: Math.ceil(total / perPage),
            nextPage: nextPageExists.length > 0 ? page + 1 : null,
        };
    }

    const transactions = await prisma.transaction.findMany({
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
        data: transactions.map((el) => ({
            ...el,
            category: {
                ...el.category,
                image: `${environmentVariables.API_URL}/assets/category/${el.category.image}.svg`,
            },
        })),
        totalPages: 1,
        prevPage: null,
        nextPage: null,
    };
};
const createTransaction = async (payload: createTransactionBody) => {
    let transaction;
    try {
        transaction = await prisma.transaction.create({
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
        await prisma.card.update({
            where: {
                id: payload.cardId,
            },
            data: {
                balance: {
                    increment: payload.amount,
                },
            },
        });
    } catch (error) {
        console.log(error);
    }

    try {
        const budgets = await prisma.budget.findMany({
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
                await prisma.budget.update({
                    where: {
                        id: budget.id,
                    },
                    data: {
                        amount: {
                            increment: tarnsactionAmount,
                        },
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
            let goalAmount = transaction.amount;
            const goal = await goalServcice.find({ id: payload.goalId });
            if (goal.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: goal.currency,
                    symbols: [transaction.card.currency],
                });
                goalAmount =
          goalAmount * (currencyRate[transaction.card.currency] || 1);
            }
            await prisma.transaction.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    goalAmount,
                },
            });
            await prisma.goal.update({
                where: {
                    id: payload.goalId,
                },
                data: {
                    balance: {
                        increment: goalAmount,
                    },
                },
            });
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }

    if (payload.loanId) {
        try {
            let loanAmount = transaction.amount;
            const loan = await loanServcice.find({ id: payload.loanId });
            if (loan.currency !== transaction.card.currency) {
                const currencyRate = await currencyService.getCurrentCurrenciesRates({
                    base: loan.currency,
                    symbols: [transaction.card.currency],
                });
                loanAmount =
          loanAmount * (currencyRate[transaction.card.currency] || 1);
            }
            await prisma.transaction.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    loanAmount,
                },
            });
            await prisma.loan.update({
                where: {
                    id: payload.loanId,
                },
                data: {
                    balance: {
                        increment: loanAmount,
                    },
                },
            });
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }

    return transaction;
};
const updateTransaction = async (
    transactionId: string,
    payload: updateTransactionBody,
) => {
    let transaction;

    try {
        transaction = await prisma.transaction.update({
            where: {
                id: transactionId,
            },
            data: {
                categoryId: payload.categoryId,
                description: payload.description || "",
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }

    return transaction;
};

export const transactionServcice = {
    find,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
