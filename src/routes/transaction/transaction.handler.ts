import { RedisKey } from "@/business/constants";
import { environmentVariables } from "@/config";
import { deleteCache } from "@/business/lib/redis";
import { FastifyReply, FastifyRequest } from "fastify";
import { transactionServcice } from "@/business/services";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    createTransactionBody,
    deleteTransactionParam,
    getTransactionParam,
    getTransactionsQueries,
    updateTransactionBody,
    updateTransactionParam,
} from "@/business/lib/validation";

const getTransaction = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: getTransactionParam;
    }>;
        const response = await transactionServcice.find({
            id: params.transactionId,
        });
        return {
            code: 200,
            data: {
                ...response,
                date: response.date.toISOString(),
                category: {
                    ...response.category,
                    image: `${environmentVariables.API_URL}/assets/category/${response.category.image}.svg`,
                },
            },
        };
    });
};
const getTransactions = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getTransactionsQueries;
    }>;
        const response = await transactionServcice.getTransactions(query);
        return {
            code: 200,
            data: {
                ...response,
                data: response.data.map((el) => ({
                    ...el,
                    date: el.date.toISOString(),
                    category: {
                        ...el.category,
                        image: `${environmentVariables.API_URL}/assets/category/${el.category.image}.svg`,
                    },
                })),
            },
        };
    });
};
const deleteTransaction = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: deleteTransactionParam;
    }>;
        await transactionServcice.deleteTransaction(params.transactionId);

        await deleteCache(RedisKey.statistic);

        return {
            code: 200,
            data: "Transaction was removed",
        };
    });
};
const updateTransaction = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateTransactionParam;
      Body: updateTransactionBody;
    }>;
        await transactionServcice.updateTransaction(params.transactionId, body);

        await deleteCache(RedisKey.statistic);

        return {
            code: 200,
            data: "Transaction info was updated",
        };
    });
};
const createTransaction = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createTransactionBody;
    }>;
        await transactionServcice.createTransaction(body);

        await deleteCache(RedisKey.statistic);

        return {
            code: 201,
            data: "Transaction was created",
        };
    });
};

export const transactionHandler = {
    getTransaction,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
