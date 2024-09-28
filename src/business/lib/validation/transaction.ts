import { z } from "zod";
import { Currencies } from "@prisma/client";
import { categoryResponseSchema } from "./category";

export const getTransactionsQueriesSchema = z
    .object({
        page: z.number(),
        currencies: z.array(
            z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
        ),
        goalIds: z.array(z.string()),
        cardIds: z.array(z.string()),
        loanIds: z.array(z.string()),
        userIds: z.array(z.string()),
        budgetIds: z.array(z.string()),
        transactionIds: z.array(z.string()),
    })
    .refine(
        (arg) => {
            if (
                !arg.budgetIds &&
        !arg.currencies &&
        !arg.goalIds &&
        !arg.transactionIds &&
        !arg.loanIds &&
        !arg.cardIds &&
        !arg.userIds
            )
                return false;
        },
        { message: "At least one query is required" },
    );

type getTransactionsQueries = z.infer<typeof getTransactionsQueriesSchema>;

export const deleteTransactionParamSchema = z.object({
    transactionId: z.string(),
});
export const updateTransactionParamSchema = z.object({
    transactionId: z.string(),
});

type deleteTransactionParam = z.infer<typeof deleteTransactionParamSchema>;
type updateTransactionParam = z.infer<typeof updateTransactionParamSchema>;

export const createTransactionBodySchema = z.object({
    amount: z.number(),
    cardId: z.string(),
    categoryId: z.string(),
    date: z.string().datetime(),
    goalId: z.string().optional(),
    loanId: z.string().optional(),
    description: z.string().optional(),
});
export const updateTransactionBodySchema =
  createTransactionBodySchema.partial();

type createTransactionBody = z.infer<typeof createTransactionBodySchema>;
type updateTransactionBody = z.infer<typeof updateTransactionBodySchema>;

export const transactionResponseSchema = z.object({
    is: z.string(),
    amount: z.number(),
    balance: z.number(),
    description: z.string(),
    date: z.string().datetime(),
    goalBalance: z.number().nullable(),
    loanBalance: z.number().nullable(),
    category: categoryResponseSchema,
});
export const transactionsResponseSchema = z.array(transactionResponseSchema);

type transactionResponse = z.infer<typeof transactionResponseSchema>;
type transactionsResponse = z.infer<typeof transactionsResponseSchema>;

export type {
    transactionResponse,
    transactionsResponse,
    createTransactionBody,
    updateTransactionBody,
    deleteTransactionParam,
    updateTransactionParam,
    getTransactionsQueries,
};
