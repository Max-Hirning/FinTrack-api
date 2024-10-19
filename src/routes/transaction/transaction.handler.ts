import { RedisKey } from "@/business/constants";
import { environmentVariables } from "@/config";
import { deleteCache } from "@/business/lib/redis";
import { FastifyReply, FastifyRequest } from "fastify";
import { transactionServcice } from "@/business/services";
import {
    redisGetSetCacheMiddleware,
    tryCatchApiMiddleware,
} from "@/business/lib/middleware";
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
        const { transactionId } = params;
        return redisGetSetCacheMiddleware(
            `${RedisKey.transaction}_${transactionId}`,
            async () => {
                const response = await transactionServcice.find({
                    id: transactionId,
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
            },
        );
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
        const {
            page,
            currencies,
            cardIds,
            budgetIds,
            userIds,
            loanIds,
            goalIds,
            transactionIds,
        } = query;
        return redisGetSetCacheMiddleware(
            `${RedisKey.transaction}${(userIds || []).map((el) => `_${el}`)}${(cardIds || []).map((el) => `_${el}`)}${(budgetIds || []).map((el) => `_${el}`)}${(loanIds || []).map((el) => `_${el}`)}${(goalIds || []).map((el) => `_${el}`)}${(transactionIds || []).map((el) => `_${el}`)}${(currencies || []).map((el) => `_${el}`)}_${page}`,
            async () => {
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
            },
        );
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

        await deleteCache(RedisKey.card);
        await deleteCache(RedisKey.goal);
        await deleteCache(RedisKey.loan);
        await deleteCache(RedisKey.budget);
        await deleteCache(RedisKey.statistic);
        await deleteCache(RedisKey.transaction);

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

        await deleteCache(RedisKey.card);
        await deleteCache(RedisKey.goal);
        await deleteCache(RedisKey.loan);
        await deleteCache(RedisKey.budget);
        await deleteCache(RedisKey.statistic);
        await deleteCache(RedisKey.transaction);

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

        await deleteCache(RedisKey.card);
        await deleteCache(RedisKey.goal);
        await deleteCache(RedisKey.loan);
        await deleteCache(RedisKey.budget);
        await deleteCache(RedisKey.statistic);
        await deleteCache(RedisKey.transaction);

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
