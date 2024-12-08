import { z } from "zod";
import { Currencies, Periods } from "@prisma/client";
import { userResponseSchema } from "../account/user";

export const getBudgetsQueriesSchema = z
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
        budgetIds: z.array(z.string()).optional(),
        currencies: z.array(
            z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
        ),
    })
    .partial();

type getBudgetsQueries = z.infer<typeof getBudgetsQueriesSchema>;

export const getBudgetParamSchema = z.object({
    budgetId: z.string(),
});
export const deleteBudgetParamSchema = z.object({
    budgetId: z.string(),
});
export const updateBudgetParamSchema = z.object({
    budgetId: z.string(),
});

type getBudgetParam = z.infer<typeof getBudgetParamSchema>;
type deleteBudgetParam = z.infer<typeof deleteBudgetParamSchema>;
type updateBudgetParam = z.infer<typeof updateBudgetParamSchema>;

export const createBudgetBodySchema = z.object({
    title: z.string(),
    balance: z.number(),
    cardIds: z.array(z.string()),
    categoryIds: z.array(z.string()),
    endDate: z.string().datetime().optional(),
    startDate: z.string().datetime().optional(),
    period: z.enum(Object.values(Periods) as [Periods, ...Periods[]]),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
});
export const updateBudgetBodySchema = createBudgetBodySchema.partial();

type createBudgetBody = z.infer<typeof createBudgetBodySchema>;
type updateBudgetBody = z.infer<typeof updateBudgetBodySchema>;

export const budgetResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    endDate: z.date(),
    amount: z.number(),
    balance: z.number(),
    startDate: z.date(),
    cards: z.array(z.string()),
    categories: z.array(z.string()),
    period: z.enum(Object.values(Periods) as [Periods, ...Periods[]]),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    user: userResponseSchema.pick({
        id: true,
        lastName: true,
        firstName: true,
    }),
});
export const budgetsListResponseSchema = z.object({
    totalPages: z.number().int(),
    data: z.array(
        budgetResponseSchema.omit({
            cards: true,
            categories: true,
        }),
    ),
    prevPage: z.number().int().nullable(),
    nextPage: z.number().int().nullable(),
});

type budgetResponse = z.infer<typeof budgetResponseSchema>;
type budgetsListResponse = z.infer<typeof budgetsListResponseSchema>;

export type {
    getBudgetsQueries,
    getBudgetParam,
    deleteBudgetParam,
    updateBudgetParam,
    createBudgetBody,
    updateBudgetBody,
    budgetResponse,
    budgetsListResponse,
};
