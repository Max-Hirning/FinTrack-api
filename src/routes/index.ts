import { FastifyInstance } from "fastify";
import { applicationRoutes } from "./application";
import { cardRoutes } from "./wallet/card/card.route";
import { loanRoutes } from "./wallet/loan/loan.route";
import { authRoutes } from "./account/auth/auth.route";
import { userRoutes } from "./account/user/user.route";
import { currencyRoutes } from "./currency/currency.route";
import { budgetRoutes } from "./wallet/budget/budget.route";

const configureRoutes = async (fastify: FastifyInstance) => {
    await fastify.register(applicationRoutes, {
        prefix: "api",
    });
    await fastify.register(authRoutes, {
        prefix: "api/auth",
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
};

export { configureRoutes };
