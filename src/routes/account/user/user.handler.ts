import fastifyAmqp from "fastify-amqp";
import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "@/business/services/account";
import { EmailType, RabbitMqQueues } from "@/types/rabbitmq";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
import {
    deleteUserParam,
    getUserParam,
    updateUserBody,
    updateUserParam,
    updateUserPasswordBody,
    updateUserPasswordParam,
} from "@/business/lib/validation/account/user";

const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: getUserParam }>;
        return userService.getUser({ id: params.userId });
    });
};
const deleteUser = async (
    request: FastifyRequest,
    reply: FastifyReply,
    channel: fastifyAmqp.FastifyAmqpChannelObject,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteUserParam }>;
        const user = await userService.deleteUser({ id: params.userId });

        const msg = JSON.stringify({
            user: {
                email: user.email,
                lastName: user.lastName,
                firstName: user.firstName,
            },
            emailType: EmailType.deleteUser,
        });
        channel.assertQueue(RabbitMqQueues.email, { durable: false });
        channel.sendToQueue(RabbitMqQueues.email, Buffer.from(msg));

        return "Account was removed";
    });
};
const updateUser = async (
    request: FastifyRequest,
    reply: FastifyReply,
    channel: fastifyAmqp.FastifyAmqpChannelObject,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateUserParam;
      Body: updateUserBody;
    }>;
        const user = await userService.updateUser(params.userId, body);

        if (body.email) {
            const msg = JSON.stringify({
                user: {
                    email: user.email,
                    lastName: user.lastName,
                    firstName: user.firstName,
                },
                emailType: EmailType.updateUserEmail,
            });
            channel.assertQueue(RabbitMqQueues.email, { durable: false });
            channel.sendToQueue(RabbitMqQueues.email, Buffer.from(msg));
        }

        return "Account info was updated";
    });
};
const updateUserPassword = async (
    request: FastifyRequest,
    reply: FastifyReply,
    channel: fastifyAmqp.FastifyAmqpChannelObject,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateUserPasswordParam;
      Body: updateUserPasswordBody;
    }>;
        const user = await userService.updateUserPassword(params.userId, body);

        try {
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
            console.log(user);
        } catch (error) {
            console.log(error);
        }

        return "Password was updated";
    });
};

export const userHandler = {
    getUser,
    deleteUser,
    updateUser,
    updateUserPassword,
};
