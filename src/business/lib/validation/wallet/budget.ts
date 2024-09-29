import { z } from "zod";
import { Currencies, Period } from "@prisma/client";
import { userResponseSchema } from "../account/user";

export const getBudgetsQueriesSchema = z
    .object({
        page: z.number(),
        userIds: z.array(z.string()),
        budgetIds: z.array(z.string()),
        currencies: z.array(
            z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
        ),
    })
    .partial()
    .refine(
        (arg) => {
            if (!arg.budgetIds && !arg.currencies && !arg.userIds) return false;
        },
        {
            message: "At least one query is required",
        },
    );

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

export const createBudgetBodySchema = z
    .object({
        title: z.string(),
        balance: z.number(),
        cardIds: z.array(z.string()),
        endDate: z.string().datetime().optional(),
        startDate: z.string().datetime().optional(),
        period: z.enum(Object.values(Period) as [Period, ...Period[]]),
        currency: z.enum(
      Object.values(Currencies) as [Currencies, ...Currencies[]],
        ),
    })
    .refine(
        (arg) => {
            if (arg.period === Period.oneTime) {
                if (!arg.startDate || !arg.endDate) return false;
            }
            return true;
        },
        {
            message: "Start date and end date is required",
        },
    );
export const updateBudgetBodySchema = z
    .object({
        title: z.string(),
        balance: z.number(),
        cardIds: z.array(z.string()),
        endDate: z.string().datetime().optional(),
        startDate: z.string().datetime().optional(),
        period: z.enum(Object.values(Period) as [Period, ...Period[]]),
    })
    .partial()
    .refine(
        (arg) => {
            if (arg.period === Period.oneTime) {
                if (!arg.startDate || !arg.endDate) return false;
            }
            return true;
        },
        {
            message: "Start date and end date is required",
        },
    );

type createBudgetBody = z.infer<typeof createBudgetBodySchema>;
type updateBudgetBody = z.infer<typeof updateBudgetBodySchema>;

export const budgetResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    amount: z.number(),
    balance: z.number(),
    endDate: z.string().datetime(),
    startDate: z.string().datetime(),
    period: z.enum(Object.values(Period) as [Period, ...Period[]]),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    user: userResponseSchema.pick({
        lastName: true,
        firstName: true,
        images: true,
    }),
});
export const budgetsListResponseSchema = z.object({
    totalPages: z.number().int(),
    data: z.array(budgetResponseSchema),
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
