import { z } from "zod";
import { Currencies } from "@prisma/client";
import { cardResponseSchema } from "./wallet/card";
import { categoryResponseSchema } from "./category";

export const getTransactionsQueriesSchema = z.object({
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
    currencies: z
        .array(z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]))
        .optional(),
    goalIds: z.array(z.string()).optional(),
    cardIds: z.array(z.string()).optional(),
    loanIds: z.array(z.string()).optional(),
    userIds: z.array(z.string()).optional(),
    budgetIds: z.array(z.string()).optional(),
    transactionIds: z.array(z.string()).optional(),
});

type getTransactionsQueries = z.infer<typeof getTransactionsQueriesSchema>;

export const getTransactionParamSchema = z.object({
    transactionId: z.string(),
});
export const deleteTransactionParamSchema = z.object({
    transactionId: z.string(),
});
export const updateTransactionParamSchema = z.object({
    transactionId: z.string(),
});

type getTransactionParam = z.infer<typeof getTransactionParamSchema>;
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
export const updateTransactionBodySchema = createTransactionBodySchema
    .pick({
        categoryId: true,
        description: true,
    })
    .partial();

type createTransactionBody = z.infer<typeof createTransactionBodySchema>;
type updateTransactionBody = z.infer<typeof updateTransactionBodySchema>;

export const transactionResponseSchema = z.object({
    id: z.string(),
    date: z.date(),
    amount: z.number(),
    description: z.string(),
    goalAmount: z.number().nullable(),
    loanAmount: z.number().nullable(),
    category: categoryResponseSchema,
    card: cardResponseSchema.omit({
        user: true,
    }),
});
export const transactionsListResponseSchema = z.object({
    totalPages: z.number().int(),
    data: z.array(transactionResponseSchema),
    prevPage: z.number().int().nullable(),
    nextPage: z.number().int().nullable(),
});

type transactionResponse = z.infer<typeof transactionResponseSchema>;
type transactionsListResponse = z.infer<typeof transactionsListResponseSchema>;

export type {
    getTransactionParam,
    transactionResponse,
    createTransactionBody,
    updateTransactionBody,
    deleteTransactionParam,
    updateTransactionParam,
    getTransactionsQueries,
    transactionsListResponse,
};
