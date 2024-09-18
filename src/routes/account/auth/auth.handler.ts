import { FastifyReply, FastifyRequest } from "fastify";
import { authService } from "@/business/services/account";
import {
    CheckOtpBody,
    RefreshTokensBody,
    RequestOtpBody,
    ResetPasswordBody,
    ResetPasswordParam,
    SignInBody,
    SignUpBody,
} from "@/business/lib/validation/account";

const signIn = async (
    request: FastifyRequest<{ Body: SignInBody }>,
    reply: FastifyReply
) => {
    const { body } = request;

    const data = authService.signIn(body);

    return reply.send(data).code(200);
};
const signUp = async (
    request: FastifyRequest<{ Body: SignUpBody }>,
    reply: FastifyReply
) => {
    const { body } = request;

    const message = authService.signUp(body);

    return reply.send(message).code(200);
};
const checkOtp = async (
    request: FastifyRequest<{ Body: CheckOtpBody }>,
    reply: FastifyReply
) => {
    const { body } = request;

    const message = authService.checkOtp(body);

    return reply.send(message).code(200);
};
const requestOtp = async (
    request: FastifyRequest<{ Body: RequestOtpBody }>,
    reply: FastifyReply
) => {
    const { body } = request;

    const message = authService.requestOtp(body);

    return reply.send(message).code(200);
};
const refreshTokens = async (
    request: FastifyRequest<{ Body: RefreshTokensBody }>,
    reply: FastifyReply
) => {
    const { body } = request;

    const message = authService.refreshTokens(body);

    return reply.send(message).code(200);
};
const resetPassword = async (
    request: FastifyRequest<{
        Params: ResetPasswordParam;
        Body: ResetPasswordBody;
    }>,
    reply: FastifyReply
) => {
    const { params, body } = request;

    const message = authService.resetPassword(params.userId, body);

    return reply.send(message).code(200);
};

export const authHandler = {
    signIn,
    signUp,
    checkOtp,
    requestOtp,
    resetPassword,
    refreshTokens,
};
