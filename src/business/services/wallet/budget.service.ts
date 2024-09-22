import { Period } from "@prisma/client";
import { currencyService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { getMonthRange, getWeekRange, getYearRange } from "@/business/lib/date";
import {
    createBudgetBody,
    getBudgetsQueries,
    updateBudgetBody,
} from "@/business/lib/validation";
import {
    BadRequestError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
} from "@/business/lib/errors";

const find = async (query: Prisma.BudgetWhereInput) => {
    try {
        const user = await prisma.budget.findFirstOrThrow({
            where: query,
        });

        return user;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const getBudgets = async (query: getBudgetsQueries) => {
    const { page, userIds, budgetIds, currencies } = query;
    const perPage = 15;
    const params: Prisma.BudgetWhereInput = {};

    if (budgetIds) {
        params.id = {
            in: budgetIds,
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
        const [total, budgets, nextPageExists] = await prisma.$transaction([
            prisma.budget.count({
                where: params,
            }),
            prisma.budget.findMany({
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
            prisma.budget.findMany({
                take: 1,
                select: {
                    id: true,
                },
                where: params,
                skip: page * perPage,
            }),
        ]);
        return {
            data: budgets,
            prevPage: page > 1 ? page - 1 : null,
            totalPages: Math.ceil(total / perPage),
            nextPage: nextPageExists.length > 0 ? page + 1 : null,
        };
    }

    const budgets = await prisma.budget.findMany({
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
        data: budgets,
        totalPages: 1,
        prevPage: null,
        nextPage: null,
    };
};
const deleteBudget = async (budgetId: string) => {
    try {
        const budget = await prisma.budget.delete({
            where: {
                id: budgetId,
            },
        });

        return budget;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const updateBudget = async (budgetId: string, payload: updateBudgetBody) => {
    let startDate = payload.startDate ? new Date(payload.startDate) : undefined;
    let endDate = payload.endDate ? new Date(payload.endDate) : undefined;
    if (payload.period) {
        switch (payload.period) {
        case Period.month:
            {
                const range = getMonthRange();
                startDate = new Date(range.startDate);
                endDate = new Date(range.endDate);
            }
            break;
        case Period.week:
            {
                const range = getWeekRange();
                startDate = new Date(range.startDate);
                endDate = new Date(range.endDate);
            }
            break;
        case Period.year:
            {
                const range = getYearRange();
                startDate = new Date(range.startDate);
                endDate = new Date(range.endDate);
            }
            break;
        default:
            break;
        }
    }
    const budget = await find({ id: budgetId });
    if (payload.endDate || payload.startDate) {
        if (budget.period !== Period.oneTime && payload.period !== Period.oneTime)
            throw new ForbiddenError(
                "Only one time budget can update startDate and endDate",
            );
    }
    if (
        (startDate && endDate && startDate >= endDate) ||
    (endDate && new Date(budget.startDate) >= endDate) ||
    (startDate && new Date(budget.endDate) <= startDate)
    )
        throw new BadRequestError("startDate can't be less or equal than endDate");

    try {
        const budget = await prisma.budget.update({
            where: {
                id: budgetId,
            },
            data: {
                endDate,
                startDate,
                title: payload.title,
                period: payload.period,
                balance: payload.balance,
                currency: payload.currency,
                cards: {
                    connect: (payload.cardIds || []).map((cardId) => ({ id: cardId })),
                },
            },
        });

        return budget;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const createBudget = async (userId: string, payload: createBudgetBody) => {
    currencyService.getCurrency(payload.currency);

    let startDate = payload.startDate ? new Date(payload.startDate) : new Date(),
        endDate = payload.endDate ? new Date(payload.endDate) : new Date();
    switch (payload.period) {
    case Period.month:
        {
            const range = getMonthRange();
            startDate = new Date(range.startDate);
            endDate = new Date(range.endDate);
        }
        break;
    case Period.week:
        {
            const range = getWeekRange();
            startDate = new Date(range.startDate);
            endDate = new Date(range.endDate);
        }
        break;
    case Period.year:
        {
            const range = getYearRange();
            startDate = new Date(range.startDate);
            endDate = new Date(range.endDate);
        }
        break;
    default:
        throw new BadRequestError("Start date and end date is required");
    }

    if (startDate >= endDate)
        throw new BadRequestError("startDate can't be less or equal than endDate");

    try {
        const budget = await prisma.budget.create({
            data: {
                title: payload.title,
                balance: payload.balance,
                currency: payload.currency,
                period: payload.period,
                startDate,
                endDate,
                userId,
                cards: {
                    connect: payload.cardIds.map((cardId) => ({ id: cardId })),
                },
            },
        });

        return budget;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};

export const budgetServcice = {
    find,
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
};
