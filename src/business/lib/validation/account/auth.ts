import { z } from "zod";
import { Roles } from "@prisma/client";

export const resetPasswordParamSchema = z.object({
    userId: z.string(),
});

type ResetPasswordParam = z.infer<typeof resetPasswordParamSchema>;

export const signInBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(15),
});
export const signUpBodySchema = z.object({
    lastName: z.string(),
    firstName: z.string(),
    email: z.string().email(),
    password: z.string().min(8).max(15),
});
export const checkOtpBodySchema = z.object({
    code: z.string(),
    email: z.string().email(),
});
export const requestOtpBodySchema = z.object({
    email: z.string().email(),
});
export const signInResponseSchema = z.object({
    user: z.object({
        id: z.string(),
        lastName: z.string(),
        firstName: z.string(),
        email: z.string().email(),
        dateOfBirth: z.string().datetime(),
        role: z.enum(Object.values(Roles) as [Roles, ...Roles[]]),
    }),
    accessToken: z.string(),
    refreshToken: z.string(),
});
export const resetPasswordBodySchema = z.object({
    code: z.string(),
    password: z.string().min(8).max(15),
});
export const refreshTokensBodySchema = z.object({
    refreshToken: z.string(),
});

type SignInBody = z.infer<typeof signInBodySchema>;
type SignUpBody = z.infer<typeof signUpBodySchema>;
type CheckOtpBody = z.infer<typeof checkOtpBodySchema>;
type RequestOtpBody = z.infer<typeof requestOtpBodySchema>;
type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
type RefreshTokensBody = z.infer<typeof refreshTokensBodySchema>;

export type {
    ResetPasswordParam,
    SignInBody,
    SignUpBody,
    CheckOtpBody,
    RequestOtpBody,
    ResetPasswordBody,
    RefreshTokensBody,
};
