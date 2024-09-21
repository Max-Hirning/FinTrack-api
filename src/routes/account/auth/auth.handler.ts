import { FastifyReply, FastifyRequest } from "fastify";
import { authService } from "@/business/services/account";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    CheckOtpBody,
    RefreshTokensBody,
    RequestOtpBody,
    ResetPasswordBody,
    SignInBody,
    SignUpBody,
} from "@/business/lib/validation/account";

const signIn = async (
    request: FastifyRequest<{ Body: SignInBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return authService.signIn(body);
    });
};
const signUp = async (
    request: FastifyRequest<{ Body: SignUpBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return authService.signUp(body);
    });
};
const checkOtp = async (
    request: FastifyRequest<{ Body: CheckOtpBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return authService.checkOtp(body);
    });
};
const requestOtp = async (
    request: FastifyRequest<{ Body: RequestOtpBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return authService.requestOtp(body);
    });
};
const refreshTokens = async (
    request: FastifyRequest<{ Body: RefreshTokensBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return authService.refreshTokens(body);
    });
};
const resetPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return authService.resetPassword(body);
    });
};

export const authHandler = {
    signIn,
    signUp,
    checkOtp,
    requestOtp,
    resetPassword,
    refreshTokens,
};
