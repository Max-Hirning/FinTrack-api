import { z } from "zod";
import { Currencies } from "@prisma/client";
import { userResponseSchema } from "../account/user";

export const getGoalsQueriesSchema = z
    .object({
        page: z.number(),
        userIds: z.array(z.string()),
        goalIds: z.array(z.string()),
        currencies: z.array(
            z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
        ),
    })
    .partial()
    .refine(
        (arg) => {
            if (!arg.goalIds && !arg.currencies && !arg.userIds) return false;
        },
        {
            message:
        "At least one of fields: 'userIds', 'goalIds' or 'currencies' is required",
        },
    );

type getGoalsQueries = z.infer<typeof getGoalsQueriesSchema>;

export const getGoalParamSchema = z.object({
    goalId: z.string(),
});
export const deleteGoalParamSchema = z.object({
    goalId: z.string(),
});
export const updateGoalParamSchema = z.object({
    goalId: z.string(),
});

type getGoalParam = z.infer<typeof getGoalParamSchema>;
type deleteGoalParam = z.infer<typeof deleteGoalParamSchema>;
type updateGoalParam = z.infer<typeof updateGoalParamSchema>;

export const createGoalBodySchema = z.object({
    title: z.string(),
    amount: z.number(),
    balance: z.number().optional(),
    deadline: z.string().datetime(),
    description: z.string().optional(),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
});
export const updateGoalBodySchema = createGoalBodySchema
    .pick({
        title: true,
        amount: true,
        deadline: true,
        currency: true,
        description: true,
    })
    .extend({
        startBalance: z.number(),
    })
    .partial();

type createGoalBody = z.infer<typeof createGoalBodySchema>;
type updateGoalBody = z.infer<typeof updateGoalBodySchema>;

export const goalResponseSchema = z.object({
    title: z.string(),
    amount: z.number(),
    balance: z.number(),
    deadline: z.string().datetime(),
    description: z.string().optional(),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    user: userResponseSchema.pick({
        lastName: true,
        firstName: true,
        images: true,
    }),
});
export const goalsListResponseSchema = z.object({
    totalPages: z.number().int(),
    data: z.array(goalResponseSchema),
    prevPage: z.number().int().nullable(),
    nextPage: z.number().int().nullable(),
});

type goalResponse = z.infer<typeof goalResponseSchema>;
type goalsListResponse = z.infer<typeof goalsListResponseSchema>;

export type {
    getGoalsQueries,
    getGoalParam,
    deleteGoalParam,
    updateGoalParam,
    createGoalBody,
    updateGoalBody,
    goalResponse,
    goalsListResponse,
};
