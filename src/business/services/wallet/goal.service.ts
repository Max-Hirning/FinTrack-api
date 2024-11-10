import { deleteCache } from "@/business/lib/redis";
import { currencyService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import {
    createGoalBody,
    updateGoalBody,
    getGoalsQueries,
} from "@/business/lib/validation";

const find = async (query: Prisma.GoalWhereInput) => {
    try {
        const user = await prisma.goal.findFirstOrThrow({
            where: query,
            include: {
                user: true,
            },
        });
        return user;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const getGoals = async (query: getGoalsQueries) => {
    const { page, userIds, goalIds, currencies } = query;
    const perPage = 15;
    const params: Prisma.GoalWhereInput = {};

    if (goalIds) {
        params.id = {
            in: goalIds,
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
        const [total, goals, nextPageExists] = await prisma.$transaction([
            prisma.goal.count({
                where: params,
            }),
            prisma.goal.findMany({
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
            prisma.goal.findMany({
                take: 1,
                select: {
                    id: true,
                },
                where: params,
                skip: page * perPage,
            }),
        ]);
        return {
            data: goals,
            prevPage: page > 1 ? page - 1 : null,
            totalPages: Math.ceil(total / perPage),
            nextPage: nextPageExists.length > 0 ? page + 1 : null,
        };
    }

    const goals = await prisma.goal.findMany({
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
        data: goals,
        totalPages: 1,
        prevPage: null,
        nextPage: null,
    };
};
const deleteGoal = async (goalId: string) => {
    let goal;
    try {
        goal = await prisma.goal.delete({
            where: {
                id: goalId,
            },
        });
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    try {
        await prisma.transaction.updateMany({
            where: {
                goalId: goal.id,
            },
            data: {
                goalId: null,
                goalAmount: null,
            },
        });
    } catch (error) {
        console.log(error);
    }

    await deleteCache(goal.userId);

    return goal;
};
const updateGoal = async (goalId: string, payload: updateGoalBody) => {
    try {
        const goal = await prisma.goal.update({
            where: {
                id: goalId,
            },
            data: {
                title: payload.title,
                amount: payload.amount,
                description: payload.description,
                deadline: payload.deadline ? new Date(payload.deadline) : undefined,
            },
        });

        await deleteCache(goal.userId);

        return goal;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const createGoal = async (userId: string, payload: createGoalBody) => {
    currencyService.getCurrency(payload.currency);

    try {
        const goal = await prisma.goal.create({
            data: {
                userId,
                title: payload.title,
                amount: payload.amount,
                balance: payload.balance,
                currency: payload.currency,
                deadline: new Date(payload.deadline),
                description: payload.description || "",
            },
        });

        await deleteCache(goal.userId);

        return goal;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};

export const goalServcice = {
    find,
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
};
