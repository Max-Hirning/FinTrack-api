import { z } from "zod";
import { Currencies } from "@prisma/client";
import { userResponseSchema } from "../account/user";

export const getLoansQueriesSchema = z
    .object({
        page: z.number(),
        userIds: z.array(z.string()),
        loanIds: z.array(z.string()),
        currencies: z.array(
            z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
        ),
    })
    .partial()
    .refine(
        (arg) => {
            if (!arg.loanIds && !arg.currencies && !arg.userIds) return false;
        },
        {
            message:
        "At least one of fields: 'userIds', 'loanIds' or 'currencies' is required",
        },
    );

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
    title: z.string(),
    amount: z.number(),
    balance: z.number(),
    description: z.string(),
    date: z.string().datetime(),
    deadline: z.string().datetime(),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    user: userResponseSchema.pick({
        lastName: true,
        firstName: true,
        images: true,
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
