import { RedisKey } from "@/business/constants";
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
                return {
                    code: 200,
                    data: transactionServcice.find({
                        id: transactionId,
                    }),
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
                return {
                    code: 200,
                    data: transactionServcice.getTransactions(query),
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
