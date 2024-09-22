import { currencyService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import {
    createLoanBody,
    getLoansQueries,
    updateLoanBody,
} from "@/business/lib/validation";

const find = async (query: Prisma.LoanWhereInput) => {
    try {
        const user = await prisma.loan.findFirstOrThrow({
            where: query,
        });

        return user;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const getLoans = async (query: getLoansQueries) => {
    const { page, userIds, loanIds, currencies } = query;
    const perPage = 15;
    const params: Prisma.LoanWhereInput = {};

    if (loanIds) {
        params.id = {
            in: loanIds,
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
        const [total, loans, nextPageExists] = await prisma.$transaction([
            prisma.loan.count({
                where: params,
            }),
            prisma.loan.findMany({
                orderBy: [
                    {
                        title: "desc",
                    },
                ],
                where: params,
                take: perPage,
                skip: (page - 1) * perPage,
                include: {
                    user: {
                        include: {
                            images: true,
                        },
                    },
                },
            }),
            prisma.loan.findMany({
                take: 1,
                select: {
                    id: true,
                },
                where: params,
                skip: page * perPage,
            }),
        ]);
        return {
            data: loans,
            prevPage: page > 1 ? page - 1 : null,
            totalPages: Math.ceil(total / perPage),
            nextPage: nextPageExists.length > 0 ? page + 1 : null,
        };
    }

    const loans = await prisma.loan.findMany({
        orderBy: [
            {
                title: "desc",
            },
        ],
        where: params,
        include: {
            user: {
                include: {
                    images: true,
                },
            },
        },
    });
    return {
        data: loans,
        totalPages: 1,
        prevPage: null,
        nextPage: null,
    };
};
const deleteLoan = async (loanId: string) => {
    try {
        const loan = await prisma.loan.delete({
            where: {
                id: loanId,
            },
        });

        return loan;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const updateLoan = async (loanId: string, payload: updateLoanBody) => {
    try {
        const loan = await prisma.loan.update({
            where: {
                id: loanId,
            },
            data: {
                title: payload.title,
                description: payload.description,
                deadline: payload.deadline ? new Date(payload.deadline) : undefined,
            },
        });

        return loan;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const createLoan = async (userId: string, payload: createLoanBody) => {
    currencyService.getCurrency(payload.currency);

    try {
        const loan = await prisma.loan.create({
            data: {
                userId,
                title: payload.title,
                amount: payload.amount,
                balance: payload.balance,
                currency: payload.currency,
                date: new Date(payload.date),
                deadline: new Date(payload.deadline),
                description: payload.description || "",
            },
        });

        return loan;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};

export const loanServcice = {
    find,
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
};
