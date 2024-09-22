import { z } from "zod";
import { Currencies, Roles } from "@prisma/client";
import { imageResponseSchema } from "@/business/lib/validation";

export const getUserParamSchema = z.object({
    userId: z.string(),
});
export const deleteUserParamSchema = z.object({
    userId: z.string(),
});
export const updateUserParamSchema = z.object({
    userId: z.string(),
});
export const updateUserPasswordParamSchema = z.object({
    userId: z.string(),
});

type getUserParam = z.infer<typeof getUserParamSchema>;
type updateUserParam = z.infer<typeof updateUserParamSchema>;
type deleteUserParam = z.infer<typeof deleteUserParamSchema>;
type updateUserPasswordParam = z.infer<typeof updateUserPasswordParamSchema>;

export const updateUserBodySchema = z
    .object({
        lastName: z.string(),
        firstName: z.string(),
        email: z.string().email(),
        goalNotification: z.boolean(),
        loanNotification: z.boolean(),
        budgetNotification: z.boolean(),
        dateOfBirth: z.string().datetime(),
        role: z.enum(Object.values(Roles) as [Roles, ...Roles[]]),
        currency: z.enum(
      Object.values(Currencies) as [Currencies, ...Currencies[]],
        ),
    })
    .partial();
export const updateUserPasswordBodySchema = z.object({
    password: z.string().min(8).max(15),
    oldPassword: z.string().min(8).max(15),
});

type updateUserBody = z.infer<typeof updateUserBodySchema>;
type updateUserPasswordBody = z.infer<typeof updateUserPasswordBodySchema>;

export const userResponseSchema = z.object({
    id: z.string(),
    email: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    dateOfBirth: z.string(),
    goalNotification: z.boolean(),
    loanNotification: z.boolean(),
    budgetNotification: z.boolean(),
    cards: z.array(z.string()),
    loans: z.array(z.string()),
    goals: z.array(z.string()),
    budgets: z.array(z.string()),
    role: z.enum(Object.values(Roles) as [Roles, ...Roles[]]),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    images: z.array(imageResponseSchema),
});

type userResponse = z.infer<typeof userResponseSchema>;

export type {
    getUserParam,
    deleteUserParam,
    updateUserParam,
    updateUserPasswordParam,
    updateUserBody,
    updateUserPasswordBody,
    userResponse,
};
