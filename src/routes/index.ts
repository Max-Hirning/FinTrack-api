import { FastifyInstance } from "fastify";
import { fileRoutes } from "./file/file.route";
import { applicationRoutes } from "./application";
import { cardRoutes } from "./wallet/card/card.route";
import { loanRoutes } from "./wallet/loan/loan.route";
import { goalRoutes } from "./wallet/goal/goal.route";
import { authRoutes } from "./account/auth/auth.route";
import { userRoutes } from "./account/user/user.route";
import { currencyRoutes } from "./currency/currency.route";
import { categoryRoutes } from "./category/category.route";
import { budgetRoutes } from "./wallet/budget/budget.route";
import { statisticRoutes } from "./statistic/statistic.route";
import { transactionRoutes } from "./transaction/transaction.route";
import { notificationRoutes } from "./account/notification/notification.route";

const configureRoutes = async (fastify: FastifyInstance) => {
    await fastify.register(applicationRoutes, {
        prefix: "api",
    });
    await fastify.register(authRoutes, {
        prefix: "api/auth",
    });
    await fastify.register(fileRoutes, {
        prefix: "api/file",
    });
    await fastify.register(userRoutes, {
        prefix: "api/user",
    });
    await fastify.register(currencyRoutes, {
        prefix: "api/currency",
    });
    await fastify.register(cardRoutes, {
        prefix: "api/card",
    });
    await fastify.register(budgetRoutes, {
        prefix: "api/budget",
    });
    await fastify.register(loanRoutes, {
        prefix: "api/loan",
    });
    await fastify.register(goalRoutes, {
        prefix: "api/goal",
    });
    await fastify.register(categoryRoutes, {
        prefix: "api/category",
    });
    await fastify.register(transactionRoutes, {
        prefix: "api/transaction",
    });
    await fastify.register(statisticRoutes, {
        prefix: "api/statistic",
    });
    await fastify.register(notificationRoutes, {
        prefix: "api/notification",
    });
};

export { configureRoutes };
