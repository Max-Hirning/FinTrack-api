import { z } from "zod";
import { Currencies } from "@prisma/client";
import { userResponseSchema } from "../account/user";

export const getGoalsQueriesSchema = z
    .object({
        page: z.number().optional(),
        userIds: z.array(z.string()).optional(),
        goalIds: z.array(z.string()).optional(),
        currencies: z.array(
            z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
        ),
    })
    .partial();

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
        description: true,
    })
    .partial();

type createGoalBody = z.infer<typeof createGoalBodySchema>;
type updateGoalBody = z.infer<typeof updateGoalBodySchema>;

export const goalResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    amount: z.number(),
    balance: z.number(),
    deadline: z.string().datetime(),
    description: z.string().optional(),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    user: userResponseSchema.pick({
        id: true,
        lastName: true,
        firstName: true,
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
