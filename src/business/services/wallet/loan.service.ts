import { fastify } from "@/bootstrap";
import { deleteCache } from "@/business/lib/redis";
import { currencyService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import {
    createLoanBody,
    getLoansQueries,
    updateLoanBody,
} from "@/business/lib/validation";
import {
    defaultLoanSelect,
    defaultUserSelect,
    loanRepository,
    transactionRepository,
} from "@/database";

const find = async (query: Prisma.LoanWhereInput) => {
    const loan = await loanRepository.findFirst({
        where: query,
        select: {
            ...defaultLoanSelect,
            user: true,
        },
    });
    if (!loan) throw new NotFoundError("No loan found");
    return loan;
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
                select: {
                    ...defaultLoanSelect,
                    user: {
                        select: {
                            ...defaultUserSelect,
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

    const loans = await loanRepository.findMany({
        orderBy: [
            {
                title: "desc",
            },
        ],
        where: params,
        select: {
            ...defaultLoanSelect,
            user: {
                select: {
                    ...defaultUserSelect,
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
    let loan;

    try {
        loan = await loanRepository.delete({
            where: {
                id: loanId,
            },
        });
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    try {
        await transactionRepository.updateMany({
            where: {
                loanId: loan.id,
            },
            data: {
                loanId: null,
                loanAmount: null,
            },
        });
    } catch (error) {
        fastify.log.error((error as Error).message);
    }

    await deleteCache(loan.userId);

    return loan;
};
const updateLoan = async (loanId: string, payload: updateLoanBody) => {
    try {
        const loan = await loanRepository.update({
            where: {
                id: loanId,
            },
            data: {
                title: payload.title,
                amount: payload.amount,
                description: payload.description,
                date: payload.date ? new Date(payload.date) : undefined,
                deadline: payload.deadline ? new Date(payload.deadline) : undefined,
            },
        });

        await deleteCache(loan.userId);

        return loan;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const createLoan = async (userId: string, payload: createLoanBody) => {
    currencyService.getCurrency(payload.currency);

    try {
        const loan = await loanRepository.create({
            data: {
                userId,
                title: payload.title,
                amount: payload.amount,
                currency: payload.currency,
                date: new Date(payload.date),
                deadline: new Date(payload.deadline),
                description: payload.description || "",
            },
        });

        await deleteCache(loan.userId);

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
