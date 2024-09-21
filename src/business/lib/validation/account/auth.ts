import { z } from "zod";
import { userResponseSchema } from "./user";

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
export const resetPasswordBodySchema = z.object({
    email: z.string().email(),
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

export const signInResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: userResponseSchema,
});
export const refreshTokensResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

type signInResponse = z.infer<typeof signInResponseSchema>;
type refreshTokensResponse = z.infer<typeof refreshTokensResponseSchema>;

export type {
    SignInBody,
    SignUpBody,
    CheckOtpBody,
    RequestOtpBody,
    ResetPasswordBody,
    RefreshTokensBody,
    signInResponse,
    refreshTokensResponse,
};
