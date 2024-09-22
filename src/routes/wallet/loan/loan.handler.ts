import { loanServcice } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    createLoanBody,
    deleteLoanParam,
    getLoansQueries,
    updateLoanBody,
    updateLoanParam,
} from "@/business/lib/validation";

const getLoans = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { query } = request as FastifyRequest<{
      Querystring: getLoansQueries;
    }>;
        return loanServcice.getLoans(query);
    });
};
const deleteLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteLoanParam }>;
        await loanServcice.deleteLoan(params.loanId);

        return "Loan was removed";
    });
};
const updateLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateLoanParam;
      Body: updateLoanBody;
    }>;
        await loanServcice.updateLoan(params.loanId, body);

        return "Loan info was updated";
    });
};
const createLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request as FastifyRequest<{
      Body: createLoanBody;
    }>;
        await loanServcice.createLoan(request.user.id, body);

        return "Loan was created";
    });
};

export const loanHandler = {
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
};
