import { FastifyInstance } from "fastify";
import { loanHandler } from "./loan.handler";
import {
    loansListResponseSchema,
    createLoanBodySchema,
    deleteLoanParamSchema,
    getLoansQueriesSchema,
    updateLoanBodySchema,
    updateLoanParamSchema,
} from "@/business/lib/validation";

export const loanRoutes = async (fastify: FastifyInstance) => {
    fastify.get(
        "/",
        {
            schema: {
                response: {
                    200: loansListResponseSchema,
                },
                tags: ["loan"],
                security: [{ bearerAuth: [] }],
                querystring: getLoansQueriesSchema,
            },
            preHandler: [fastify.authorization],
        },
        loanHandler.getLoans,
    );
    fastify.put(
        "/:loanId",
        {
            schema: {
                tags: ["loan"],
                body: updateLoanBodySchema,
                params: updateLoanParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        loanHandler.updateLoan,
    );
    fastify.delete(
        "/:loanId",
        {
            schema: {
                tags: ["loan"],
                params: deleteLoanParamSchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        loanHandler.deleteLoan,
    );
    fastify.post(
        "/",
        {
            schema: {
                tags: ["loan"],
                body: createLoanBodySchema,
                security: [{ bearerAuth: [] }],
            },
            preHandler: [fastify.authorization],
        },
        loanHandler.createLoan,
    );
};
