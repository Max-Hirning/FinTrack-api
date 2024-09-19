import { FastifyInstance } from "fastify";
import { authHandler } from "./auth.handler";
import {
    signInBodySchema,
    signUpBodySchema,
    checkOtpBodySchema,
    requestOtpBodySchema,
    signInResponseSchema,
    refreshTokensBodySchema,
    resetPasswordBodySchema,
} from "@/business/lib/validation/account";

export const authRoutes = async (fastify: FastifyInstance) => {
    fastify.put(
        "/reset-password",
        {
            schema: {
                tags: ["auth"],
                body: resetPasswordBodySchema,
            },
        },
        authHandler.resetPassword,
    );
    fastify.post(
        "/sign-in",
        {
            schema: {
                response: {
                    200: signInResponseSchema,
                },
                tags: ["auth"],
                body: signInBodySchema,
            },
        },
        authHandler.signIn,
    );
    fastify.post(
        "/sign-up",
        {
            schema: {
                tags: ["auth"],
                body: signUpBodySchema,
            },
        },
        authHandler.signUp,
    );
    fastify.post(
        "/request-otp",
        {
            schema: {
                tags: ["auth"],
                body: requestOtpBodySchema,
            },
        },
        authHandler.requestOtp,
    );
    fastify.post(
        "/check-otp",
        {
            schema: {
                tags: ["auth"],
                body: checkOtpBodySchema,
            },
        },
        authHandler.checkOtp,
    );
    fastify.post(
        "/refresh-tokens",
        {
            schema: {
                tags: ["auth"],
                body: refreshTokensBodySchema,
            },
        },
        authHandler.refreshTokens,
    );
};
