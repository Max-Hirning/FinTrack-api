import { FastifyInstance } from "fastify";
import { transactionHandler } from "./transaction.handler";
import {
    transactionsListResponseSchema,
    createTransactionBodySchema,
    deleteTransactionParamSchema,
    updateTransactionBodySchema,
    updateTransactionParamSchema,
    getTransactionsQueriesSchema,
} from "@/business/lib/validation";

export const transactionRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: transactionsListResponseSchema,
                },
                tags: ["transaction"],
                security: [{ bearerAuth: [] }],
                querystring: getTransactionsQueriesSchema,
            },
            preHandler: [fastify.authorization],
        },
        transactionHandler.getTransactions,
    );
    fastify.put(
        "/:transactionId",
        {
            schema: {
                tags: ["transaction"],
                body: updateTransactionBodySchema,
                params: updateTransactionParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        transactionHandler.updateTransaction,
    );
    fastify.delete(
        "/:transactionId",
        {
            schema: {
                tags: ["transaction"],
                params: deleteTransactionParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        transactionHandler.deleteTransaction,
    );
    fastify.post(
        "/",
        {
            schema: {
                tags: ["transaction"],
                body: createTransactionBodySchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        transactionHandler.createTransaction,
    );
};
