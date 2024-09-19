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
                querystring: resetPasswordBodySchema,
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
                querystring: signUpBodySchema,
            },
        },
        authHandler.signUp,
    );
    fastify.post(
        "/request-otp",
        {
            schema: {
                tags: ["auth"],
                querystring: requestOtpBodySchema,
            },
        },
        authHandler.requestOtp,
    );
    fastify.post(
        "/check-otp",
        {
            schema: {
                tags: ["auth"],
                querystring: checkOtpBodySchema,
            },
        },
        authHandler.checkOtp,
    );
    fastify.post(
        "/refresh-tokens",
        {
            schema: {
                tags: ["auth"],
                querystring: refreshTokensBodySchema,
            },
        },
        authHandler.refreshTokens,
    );
};
