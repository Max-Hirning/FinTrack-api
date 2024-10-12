import { authHandler } from "./auth.handler";
import { FastifyInstance, FastifyRequest } from "fastify";
import {
    signInBodySchema,
    signUpBodySchema,
    checkOtpBodySchema,
    requestOtpBodySchema,
    signInResponseSchema,
    refreshTokensBodySchema,
    resetPasswordBodySchema,
    refreshTokensResponseSchema,
    ResetPasswordBody,
} from "@/business/lib/validation";

export const authRoutes = async (fastify: FastifyInstance) => {
    fastify.put(
        "/reset-password",
        {
            schema: {
                tags: ["auth"],
                body: resetPasswordBodySchema,
            },
        },
        function (request: FastifyRequest<{ Body: ResetPasswordBody }>, reply) {
            return authHandler.resetPassword(request, reply, this.amqp.channel);
        },
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
        "/pre/sign-up",
        {
            schema: {
                tags: ["auth"],
                body: signUpBodySchema,
            },
        },
        authHandler.preSignUp,
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
                response: {
                    200: refreshTokensResponseSchema,
                },
                tags: ["auth"],
                body: refreshTokensBodySchema,
            },
        },
        authHandler.refreshTokens,
    );
};
