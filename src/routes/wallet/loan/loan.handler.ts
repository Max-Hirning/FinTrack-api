import { loanServcice } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    createLoanBody,
    deleteLoanParam,
    getLoanParam,
    getLoansQueries,
    loanResponse,
    loansListResponse,
    updateLoanBody,
    updateLoanParam,
} from "@/business/lib/validation";

const getLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware<loanResponse>(reply, async () => {
        const { params } = request as FastifyRequest<{
      Params: getLoanParam;
    }>;
        const response = await loanServcice.find({ id: params.loanId });
        return {
            code: 200,
            data: response,
        };
    });
};
const getLoans = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware<loansListResponse>(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getLoansQueries;
    }>;
        const response = await loanServcice.getLoans(query);
        return {
            code: 200,
            data: response,
        };
    });
};
const deleteLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteLoanParam }>;
        await loanServcice.deleteLoan(params.loanId);

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
        await loanServcice.updateLoan(params.loanId, body);

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
        await loanServcice.createLoan(request.user.id, body);

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
