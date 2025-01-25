import { Periods } from "@prisma/client";
import { RedisKey } from "@/business/constants";
import { deleteCache } from "@/business/lib/redis";
import { currencyService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { getMonthRange, getWeekRange, getYearRange } from "@/business/lib/date";
import {
    budgetRepository,
    defaultBudgetSelect,
    defaultUserSelect,
} from "@/database";
import {
    createBudgetBody,
    updateBudgetBody,
    getBudgetsQueries,
} from "@/business/lib/validation";
import {
    NotFoundError,
    ForbiddenError,
    BadRequestError,
    InternalServerError,
} from "@/business/lib/errors";

const find = async (query: Prisma.BudgetWhereInput) => {
    const budget = await budgetRepository.findFirst({
        where: query,
        select: {
            ...defaultBudgetSelect,
            user: true,
            cards: true,
            categories: true,
        },
    });
    if (!budget) throw new NotFoundError("No budget found");
    return budget;
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
                select: {
                    ...defaultBudgetSelect,
                    user: {
                        select: {
                            ...defaultUserSelect,
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

    const budgets = await budgetRepository.findMany({
        orderBy: [
            {
                title: "desc",
            },
        ],
        where: params,
        select: {
            ...defaultBudgetSelect,
            user: {
                select: {
                    ...defaultUserSelect,
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
        const budget = await budgetRepository.delete({
            where: {
                id: budgetId,
            },
        });

        await deleteCache(budget.userId);

        return budget;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const validateBudget = (payload: updateBudgetBody) => {
    if (payload.period === Periods.oneTime) {
        if (!payload.startDate || !payload.endDate)
            throw new BadRequestError("Start date and end date is required");
    }
};
const updateBudget = async (budgetId: string, payload: updateBudgetBody) => {
    validateBudget(payload);
    let startDate = payload.startDate ? new Date(payload.startDate) : undefined;
    let endDate = payload.endDate ? new Date(payload.endDate) : undefined;
    if (payload.period) {
        switch (payload.period) {
        case Periods.month:
            {
                const range = getMonthRange();
                startDate = new Date(range.startDate);
                endDate = new Date(range.endDate);
            }
            break;
        case Periods.week:
            {
                const range = getWeekRange();
                startDate = new Date(range.startDate);
                endDate = new Date(range.endDate);
            }
            break;
        case Periods.year:
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
        if (budget.period !== Periods.oneTime && payload.period !== Periods.oneTime)
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
    if (payload.cardIds) {
        try {
            await budgetRepository.update({
                where: {
                    id: budgetId,
                },
                data: {
                    cards: {
                        set: [],
                    },
                },
            });
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }
    if (payload.categoryIds) {
        try {
            await budgetRepository.update({
                where: {
                    id: budgetId,
                },
                data: {
                    categories: {
                        set: [],
                    },
                },
            });
        } catch (error) {
            throw new InternalServerError((error as Error).message);
        }
    }

    try {
        const budget = await budgetRepository.update({
            where: {
                id: budgetId,
            },
            data: {
                endDate,
                startDate,
                title: payload.title,
                period: payload.period,
                balance: payload.balance,
                cards: {
                    connect: (payload.cardIds || []).map((cardId) => ({ id: cardId })),
                },
                categories: {
                    connect: (payload.categoryIds || []).map((categoryId) => ({
                        id: categoryId,
                    })),
                },
            },
        });

        await deleteCache(budget.userId);

        return budget;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const createBudget = async (userId: string, payload: createBudgetBody) => {
    validateBudget(payload);
    currencyService.getCurrency(payload.currency);

    let startDate = payload.startDate ? new Date(payload.startDate) : new Date(),
        endDate = payload.endDate ? new Date(payload.endDate) : new Date();
    switch (payload.period) {
    case Periods.month:
        {
            const range = getMonthRange();
            startDate = new Date(range.startDate);
            endDate = new Date(range.endDate);
        }
        break;
    case Periods.week:
        {
            const range = getWeekRange();
            startDate = new Date(range.startDate);
            endDate = new Date(range.endDate);
        }
        break;
    case Periods.year:
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
        const budget = await budgetRepository.create({
            data: {
                amount: 0,
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
                categories: {
                    connect: payload.categoryIds.map((categoryId) => ({
                        id: categoryId,
                    })),
                },
            },
        });

        await deleteCache(budget.userId);

        return budget;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const updateBudgetsDateRange = async (period: Periods) => {
    let startDate = new Date(),
        endDate = new Date();
    switch (period) {
    case Periods.month:
        {
            const range = getMonthRange();
            startDate = new Date(range.startDate);
            endDate = new Date(range.endDate);
        }
        break;
    case Periods.week:
        {
            const range = getWeekRange();
            startDate = new Date(range.startDate);
            endDate = new Date(range.endDate);
        }
        break;
    case Periods.year:
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
        const budget = await budgetRepository.updateMany({
            where: {
                period,
            },
            data: {
                amount: 0,
                startDate,
                endDate,
            },
        });

        await deleteCache(RedisKey.statistic);

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
    updateBudgetsDateRange,
};
