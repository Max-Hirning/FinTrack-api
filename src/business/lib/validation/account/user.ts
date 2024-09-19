import { z } from "zod";

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
        dateOfBirth: z.string().datetime(),
    })
    .partial();
export const updateUserPasswordBodySchema = z.object({
    password: z.string().min(8).max(15),
    oldPassword: z.string().min(8).max(15),
});

type updateUserBody = z.infer<typeof updateUserBodySchema>;
type updateUserPasswordBody = z.infer<typeof updateUserPasswordBodySchema>;

export type {
    getUserParam,
    deleteUserParam,
    updateUserParam,
    updateUserPasswordParam,
    updateUserBody,
    updateUserPasswordBody,
};
