import { cardServcice } from "./wallet/card.service";
import { goalServcice } from "./wallet/goal.service";
import { loanServcice } from "./wallet/loan.service";
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
        });
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    try {
        await prisma.transaction.updateMany({
            where: {
                date: {
                    gte: transaction.date,
                },
            },
            data: {
                balance: {
                    increment: -1 * transaction.amount,
                },
            },
        });
    } catch (error) {
        console.log(error);
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
        console.log(error);
    }

    if (transaction.goalId) {
        try {
            await prisma.goal.update({
                where: {
                    id: transaction.goalId,
                },
                data: {
                    balance: {
                        increment: -1 * transaction.amount,
                    },
                },
            });
        } catch (error) {
            console.log(error);
        }
    }

    if (transaction.loanId) {
        try {
            await prisma.loan.update({
                where: {
                    id: transaction.loanId,
                },
                data: {
                    balance: {
                        increment: -1 * transaction.amount,
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
        const user = await prisma.transaction.findFirstOrThrow({
            where: query,
        });
        return user;
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

    const transactions = await prisma.transaction.findMany({
        orderBy: [
            {
                date: "desc",
            },
        ],
        where: params,
        include: {
            category: true,
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
    let transaction, nearestTransaction;
    try {
        transaction = await prisma.transaction.create({
            data: {
                balance: 0,
                date: payload.date,
                amount: payload.amount,
                cardId: payload.cardId,
                goalId: payload.goalId,
                loanId: payload.loanId,
                categoryId: payload.categoryId,
                description: payload.description || "",
            },
        });
        nearestTransaction = await prisma.transaction.findFirst({
            where: {
                date: {
                    lte: transaction.date,
                },
            },
            orderBy: {
                date: "desc",
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
        if (nearestTransaction) {
            await prisma.transaction.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    balance: nearestTransaction.balance + transaction.amount,
                },
            });
        }
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }

    if (payload.goalId) {
        try {
            const goal = await prisma.goal.update({
                where: {
                    id: payload.goalId,
                },
                data: {
                    balance: {
                        increment: payload.amount,
                    },
                },
            });
            await prisma.transaction.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    goalBalance: goal.balance,
                },
            });
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }

    if (payload.loanId) {
        try {
            const loan = await prisma.loan.update({
                where: {
                    id: payload.loanId,
                },
                data: {
                    balance: {
                        increment: payload.amount,
                    },
                },
            });
            await prisma.transaction.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    loanBalance: loan.balance,
                },
            });
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }

    try {
        await prisma.transaction.updateMany({
            where: {
                date: {
                    gte: transaction.date,
                },
            },
            data: {
                balance: {
                    increment: transaction.amount,
                },
                ...(transaction.goalId && {
                    goalBalance: {
                        increment: transaction.amount,
                    },
                }),
                ...(transaction.loanId && {
                    loanBalance: {
                        increment: transaction.amount,
                    },
                }),
            },
        });
    } catch (error) {
        console.log(error);
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
                date: payload.date,
                amount: payload.amount,
                categoryId: payload.categoryId,
                description: payload.description || "",
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }

    if (payload.amount) {
        try {
            const nearestTransaction = await prisma.transaction.findFirst({
                where: {
                    date: {
                        lte: transaction.date,
                    },
                },
                orderBy: {
                    date: "desc",
                },
            });
            if (nearestTransaction) {
                await prisma.transaction.update({
                    where: {
                        id: transaction.id,
                    },
                    data: {
                        balance: nearestTransaction.balance + transaction.amount,
                    },
                });
            }
        } catch (error) {
            console.log(error);
        }
        try {
            const card = await cardServcice.find({
                id: transaction.cardId,
            });
            await prisma.card.update({
                where: {
                    id: transaction.id,
                },
                data: {
                    balance: {
                        increment: -1 * card.balance + transaction.amount,
                    },
                },
            });
        } catch (error) {
            console.log(error);
        }
        if (transaction.goalId) {
            try {
                const goal = await goalServcice.find({
                    id: transaction.goalId,
                });
                await prisma.goal.update({
                    where: {
                        id: goal.id,
                    },
                    data: {
                        balance: {
                            increment: -1 * goal.balance + transaction.amount,
                        },
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }
        if (transaction.loanId) {
            try {
                const loan = await loanServcice.find({
                    id: transaction.loanId,
                });
                await prisma.loan.update({
                    where: {
                        id: loan.id,
                    },
                    data: {
                        balance: {
                            increment: -1 * loan.balance + transaction.amount,
                        },
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }
        try {
            await prisma.transaction.updateMany({
                where: {
                    date: {
                        gte: transaction.date,
                    },
                },
                data: {
                    balance: {
                        increment: transaction.amount,
                    },
                    ...(transaction.goalId && {
                        goalBalance: {
                            increment: transaction.amount,
                        },
                    }),
                    ...(transaction.loanId && {
                        loanBalance: {
                            increment: transaction.amount,
                        },
                    }),
                },
            });
        } catch (error) {
            console.log(error);
        }
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
