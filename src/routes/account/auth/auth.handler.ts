import fastifyAmqp from "fastify-amqp";
import { authService } from "@/business/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { EmailType, RabbitMqQueues } from "@/types/rabbitmq";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    CheckOtpBody,
    RefreshTokensBody,
    RequestOtpBody,
    ResetPasswordBody,
    SignInBody,
    signInResponse,
    SignUpBody,
} from "@/business/lib/validation";

const signIn = async (
    request: FastifyRequest<{ Body: SignInBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware<signInResponse>(reply, async () => {
        const { body } = request;
        return {
            code: 200,
            data: await authService.signIn(body),
        };
    });
};
const signUp = async (
    request: FastifyRequest<{ Body: SignUpBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return {
            code: 201,
            data: await authService.signUp(body),
        };
    });
};
const checkOtp = async (
    request: FastifyRequest<{ Body: CheckOtpBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return {
            code: 200,
            data: await authService.checkOtp(body),
        };
    });
};
const preSignUp = async (
    request: FastifyRequest<{ Body: SignUpBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return {
            code: 200,
            data: await authService.preSignUp(body),
        };
    });
};
const requestOtp = async (
    request: FastifyRequest<{ Body: RequestOtpBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        return {
            code: 200,
            data: await authService.requestOtp(body),
        };
    });
};
const refreshTokens = async (
    request: FastifyRequest<{ Body: RefreshTokensBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware<signInResponse>(reply, async () => {
        const { body } = request;
        return {
            code: 201,
            data: await authService.refreshTokens(body),
        };
    });
};
const resetPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordBody }>,
    reply: FastifyReply,
    channel: fastifyAmqp.FastifyAmqpChannelObject,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { body } = request;
        const user = await authService.resetPassword(body);

        const msg = JSON.stringify({
            user: {
                email: user.email,
                lastName: user.lastName,
                firstName: user.firstName,
            },
            emailType: EmailType.updateUserPassword,
        });
        channel.assertQueue(RabbitMqQueues.email, { durable: false });
        channel.sendToQueue(RabbitMqQueues.email, Buffer.from(msg));

        return {
            code: 200,
            data: "Password was updated",
        };
    });
};

export const authHandler = {
    signIn,
    signUp,
    checkOtp,
    preSignUp,
    requestOtp,
    resetPassword,
    refreshTokens,
};
