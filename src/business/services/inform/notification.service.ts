import { Prisma, prisma } from "@/database/prisma/prisma";
import { addDays, format, isBefore, startOfDay, startOfToday } from "date-fns";
import {
    budgetRepository,
    defaultNotificationSelect,
    goalRepository,
    loanRepository,
    notificationRepository,
    userRepository,
} from "@/database";

const goals = async () => {
    const currentDate = startOfDay(new Date());

    try {
        const goals = await goalRepository.findMany({
            where: {
                deadline: {
                    lte: currentDate,
                },
            },
        });
        const nearBorderGoals = goals.filter(
            (goal) => goal.amount <= goal.balance * 0.95,
        );
        const nearDeadlineGoals = goals.filter((goal) => {
            const deadlineOneDayBefore = startOfDay(addDays(goal.deadline, -1));
            return (
                isBefore(currentDate, deadlineOneDayBefore) &&
        currentDate >= startOfDay(goal.deadline)
            );
        });
        const notifications = [];
        for (const goal of nearBorderGoals) {
            notifications.push({
                goalId: goal.id,
                userId: goal.userId,
                title: "Goal Near Border",
                message: `You are 5% away from reaching your ${goal.title} goal limit.`,
            });
        }
        for (const goal of nearDeadlineGoals) {
            notifications.push({
                goalId: goal.id,
                userId: goal.userId,
                title: "Goal Deadline",
                message: `Just a reminder that your goal *${goal.title} is due tomorrow, ${format(goal.deadline, "yyyy-MM-dd")}.`,
            });
        }
        await notificationRepository.createMany({
            data: notifications,
        });
    } catch (error) {
        console.log(error);
    }
};
const loans = async () => {
    const currentDate = startOfDay(new Date());

    try {
        const loans = await loanRepository.findMany({
            where: {
                deadline: {
                    lte: currentDate,
                },
            },
        });
        const nearBorderLoans = loans.filter(
            (loan) => loan.amount <= loan.balance * 0.95,
        );
        const nearDeadlineLoans = loans.filter((loan) => {
            const deadlineOneDayBefore = startOfDay(addDays(loan.deadline, -1));
            return (
                isBefore(currentDate, deadlineOneDayBefore) &&
        currentDate >= startOfDay(loan.deadline)
            );
        });
        const notifications = [];
        for (const loan of nearBorderLoans) {
            notifications.push({
                loanId: loan.id,
                userId: loan.userId,
                title: "Loan Near Border",
                message: `You are 5% away from reaching your ${loan.title} loan limit.`,
            });
        }
        for (const loan of nearDeadlineLoans) {
            notifications.push({
                loanId: loan.id,
                userId: loan.userId,
                title: "Loan Deadline",
                message: `Just a reminder that your loan ${loan.title} is due tomorrow, ${format(loan.deadline, "yyyy-MM-dd")}.`,
            });
        }
        await notificationRepository.createMany({
            data: notifications,
        });
    } catch (error) {
        console.log(error);
    }
};
const budgets = async () => {
    const currentDate = startOfDay(new Date());

    try {
        const budgets = await budgetRepository.findMany({
            where: {
                startDate: {
                    lte: currentDate,
                },
                endDate: {
                    gte: currentDate,
                },
            },
        });
        const overwhelmedBudgets = budgets.filter(
            (budget) => budget.amount > budget.balance,
        );
        const nearBorderBudgets = budgets.filter(
            (budget) => budget.amount <= budget.balance * 0.95,
        );
        const notifications = [];
        for (const budget of overwhelmedBudgets) {
            let overwhelmedPercentage = 0;
            if (budget.amount > budget.balance) {
                overwhelmedPercentage =
          ((budget.amount - budget.balance) / budget.balance) * 100;
            }
            notifications.push({
                budgetId: budget.id,
                userId: budget.userId,
                title: "Overwhelming Budget",
                message: `You have exceeded your ${budget.title} budget by ${overwhelmedPercentage}%.`,
            });
        }
        for (const budget of nearBorderBudgets) {
            notifications.push({
                budgetId: budget.id,
                userId: budget.userId,
                title: "Budget Near Border",
                message: `You are 5% away from reaching your ${budget.title} budget limit.`,
            });
        }
        await notificationRepository.createMany({
            data: notifications,
        });
    } catch (error) {
        console.log(error);
    }
};
const happyNewYear = async () => {
    try {
        const users = await userRepository.findMany();
        const notifications = [];
        for (const user of users) {
            notifications.push({
                userId: user.id,
                title: "🎉 Happy New Year! 🎉",
                message:
          "Wishing you a year filled with joy, success, and new adventures. Cheers to fresh starts and wonderful memories ahead!",
            });
        }
        await notificationRepository.createMany({
            data: notifications,
        });
    } catch (error) {
        console.log(error);
    }
};
const happyBirthday = async () => {
    try {
        const users = await userRepository.findMany({
            where: {
                dateOfBirth: format(startOfToday(), "yyyy-MM-dd"), // Prisma will match only the date part (ignoring the time)
            },
        });
        const notifications = [];
        for (const user of users) {
            notifications.push({
                userId: user.id,
                title: `🎉 Happy Birthday, ${user.firstName}! 🎉`,
                message:
          "Wishing you a day filled with joy and a year ahead filled with amazing adventures. Enjoy your special day!",
            });
        }
        await notificationRepository.createMany({
            data: notifications,
        });
    } catch (error) {
        console.log(error);
    }
};
const happyChristmas = async () => {
    try {
        const users = await userRepository.findMany();
        const notifications = [];
        for (const user of users) {
            notifications.push({
                userId: user.id,
                title: "🎄 Merry Christmas! 🎄",
                message:
          "Wishing you a joyful holiday season filled with love, laughter, and cherished moments. May your days be merry and bright!",
            });
        }
        await notificationRepository.createMany({
            data: notifications,
        });
    } catch (error) {
        console.log(error);
    }
};
const getNotifications = async (userId: string, page?: number) => {
    const perPage = 15;
    const params: Prisma.NotificationWhereInput = {
        userId,
    };

    if (page) {
        const [total, notifications, nextPageExists] = await prisma.$transaction([
            prisma.notification.count({
                where: params,
            }),
            prisma.notification.findMany({
                orderBy: [
                    {
                        createdAt: "desc",
                    },
                ],
                where: params,
                take: perPage,
                skip: (page - 1) * perPage,
                select: {
                    ...defaultNotificationSelect,
                    user: true,
                },
            }),
            prisma.notification.findMany({
                take: 1,
                select: {
                    id: true,
                },
                where: params,
                skip: page * perPage,
            }),
        ]);
        return {
            data: notifications,
            prevPage: page > 1 ? page - 1 : null,
            totalPages: Math.ceil(total / perPage),
            nextPage: nextPageExists.length > 0 ? page + 1 : null,
        };
    }

    const notifications = await notificationRepository.findMany({
        orderBy: [
            {
                createdAt: "desc",
            },
        ],
        where: params,
        select: {
            ...defaultNotificationSelect,
            user: true,
        },
    });

    return {
        data: notifications,
        totalPages: 1,
        prevPage: null,
        nextPage: null,
    };
};

export const notificationService = {
    goals,
    loans,
    budgets,
    happyNewYear,
    happyBirthday,
    happyChristmas,
    getNotifications,
};
