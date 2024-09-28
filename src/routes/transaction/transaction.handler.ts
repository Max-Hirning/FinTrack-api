import { FastifyReply, FastifyRequest } from "fastify";
import { transactionServcice } from "@/business/services";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    createTransactionBody,
    deleteTransactionParam,
    getTransactionsQueries,
    updateTransactionBody,
    updateTransactionParam,
} from "@/business/lib/validation";

const getTransactions = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getTransactionsQueries;
    }>;
        return transactionServcice.getTransactions(query);
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

        return "Transaction was removed";
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

        return "Transaction info was updated";
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

        return "Transaction was created";
    });
};

export const transactionHandler = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
