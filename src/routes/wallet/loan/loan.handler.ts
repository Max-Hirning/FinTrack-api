import { RedisKey } from "@/business/constants";
import { loanServcice } from "@/business/services";
import { deleteCache } from "@/business/lib/redis";
import { FastifyReply, FastifyRequest } from "fastify";
import {
    redisGetSetCacheMiddleware,
    tryCatchApiMiddleware,
} from "@/business/lib/middleware";
import {
    createLoanBody,
    deleteLoanParam,
    getLoanParam,
    getLoansQueries,
    updateLoanBody,
    updateLoanParam,
} from "@/business/lib/validation";

const getLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: getLoanParam;
    }>;
        const { loanId } = params;
        return redisGetSetCacheMiddleware(
            `${RedisKey.loan}_${loanId}`,
            async () => {
                const response = await loanServcice.find({ id: params.loanId });
                return {
                    code: 200,
                    data: {
                        ...response,
                        date: response.date.toISOString(),
                        deadline: response.deadline.toISOString(),
                    },
                };
            },
        );
    });
};
const getLoans = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getLoansQueries;
    }>;
        const { page, loanIds, userIds, currencies } = query;
        return redisGetSetCacheMiddleware(
            `${RedisKey.loan}${(userIds || []).map((el) => `_${el}`)}${(currencies || []).map((el) => `_${el}`)}${(loanIds || []).map((el) => `_${el}`)}_${page}`,
            async () => {
                const response = await loanServcice.getLoans(query);
                return {
                    code: 200,
                    data: {
                        ...response,
                        data: response.data.map((el) => ({
                            ...el,
                            date: el.date.toISOString(),
                            deadline: el.deadline.toISOString(),
                        })),
                    },
                };
            },
        );
    });
};
const deleteLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteLoanParam }>;
        const loan = await loanServcice.deleteLoan(params.loanId);

        await deleteCache(`${RedisKey.loan}_${loan.userId}`);

        return {
            code: 200,
            data: "Loan was removed",
        };
    });
};
const updateLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateLoanParam;
      Body: updateLoanBody;
    }>;
        const loan = await loanServcice.updateLoan(params.loanId, body);

        await deleteCache(`${RedisKey.loan}_${loan.userId}`);

        return {
            code: 200,
            data: "Loan info was updated",
        };
    });
};
const createLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createLoanBody;
    }>;
        const loan = await loanServcice.createLoan(request.user.id, body);

        await deleteCache(`${RedisKey.loan}_${loan.userId}`);

        return {
            code: 201,
            data: "Loan was created",
        };
    });
};

export const loanHandler = {
    getLoan,
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
};
