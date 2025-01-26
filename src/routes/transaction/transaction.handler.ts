import { environmentVariables } from "@/config";
import { FastifyReply, FastifyRequest } from "fastify";
import { transactionServcice } from "@/business/services";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    createTransactionBody,
    deleteTransactionParam,
    getTransactionParam,
    getTransactionsQueries,
    transactionResponse,
    transactionsListResponse,
    updateTransactionBody,
    updateTransactionParam,
} from "@/business/lib/validation";

const getTransaction = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware<transactionResponse>(reply, async () => {
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
    return tryCatchApiMiddleware<transactionsListResponse>(reply, async () => {
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
