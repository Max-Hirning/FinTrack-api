import { z } from "zod";
import { userResponseSchema } from "../account/user";
import { Currencies, Statuses } from "@prisma/client";

export const getLoansQueriesSchema = z
    .object({
        page: z
            .string()
            .transform((val) => {
                const parsedPage = Number(val);
                if (isNaN(parsedPage)) {
                    throw new Error("Page must be a valid number");
                }
                return parsedPage;
            })
            .optional(),
        userIds: z.array(z.string()).optional(),
        loanIds: z.array(z.string()).optional(),
        currencies: z.array(
            z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
        ),
    })
    .partial();

type getLoansQueries = z.infer<typeof getLoansQueriesSchema>;

export const getLoanParamSchema = z.object({
    loanId: z.string(),
});
export const deleteLoanParamSchema = z.object({
    loanId: z.string(),
});
export const updateLoanParamSchema = z.object({
    loanId: z.string(),
});

type getLoanParam = z.infer<typeof getLoanParamSchema>;
type deleteLoanParam = z.infer<typeof deleteLoanParamSchema>;
type updateLoanParam = z.infer<typeof updateLoanParamSchema>;

export const createLoanBodySchema = z.object({
    title: z.string(),
    amount: z.number(),
    date: z.string().datetime(),
    deadline: z.string().datetime(),
    description: z.string().optional(),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
});
export const updateLoanBodySchema = createLoanBodySchema
    .pick({
        date: true,
        title: true,
        amount: true,
        deadline: true,
        description: true,
    })
    .partial();

type createLoanBody = z.infer<typeof createLoanBodySchema>;
type updateLoanBody = z.infer<typeof updateLoanBodySchema>;

export const loanResponseSchema = z.object({
    id: z.string(),
    date: z.date(),
    title: z.string(),
    deadline: z.date(),
    amount: z.number(),
    balance: z.number(),
    description: z.string(),
    status: z.enum(Object.values(Statuses) as [Statuses, ...Statuses[]]),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    user: userResponseSchema.pick({
        id: true,
        lastName: true,
        firstName: true,
    }),
});
export const loansListResponseSchema = z.object({
    totalPages: z.number().int(),
    data: z.array(loanResponseSchema),
    prevPage: z.number().int().nullable(),
    nextPage: z.number().int().nullable(),
});

type loanResponse = z.infer<typeof loanResponseSchema>;
type loansListResponse = z.infer<typeof loansListResponseSchema>;

export type {
    getLoansQueries,
    getLoanParam,
    deleteLoanParam,
    updateLoanParam,
    createLoanBody,
    updateLoanBody,
    loanResponse,
    loansListResponse,
};
