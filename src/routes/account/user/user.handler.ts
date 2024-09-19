import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "@/business/services/account";
import {
    deleteUserParam,
    getUserParam,
    updateUserBody,
    updateUserParam,
    updateUserPasswordBody,
    updateUserPasswordParam,
} from "@/business/lib/validation/account/user";

const getUser = async (
    request: FastifyRequest<{ Params: getUserParam }>,
    reply: FastifyReply,
) => {
    const { params } = request;

    const data = userService.getUser({ id: params.userId });

    return reply.send(data).code(200);
};
const deleteUser = async (
    request: FastifyRequest<{ Params: deleteUserParam }>,
    reply: FastifyReply,
) => {
    const { params } = request;

    const data = userService.deleteUser({ id: params.userId });

    return reply.send(data).code(200);
};
const updateUser = async (
    request: FastifyRequest<{ Params: updateUserParam; Body: updateUserBody }>,
    reply: FastifyReply,
) => {
    const { params, body } = request;

    const message = userService.updateUser(params.userId, body);

    return reply.send(message).code(200);
};
const updateUserPassword = async (
    request: FastifyRequest<{
    Params: updateUserPasswordParam;
    Body: updateUserPasswordBody;
  }>,
    reply: FastifyReply,
) => {
    const { params, body } = request;

    const message = userService.updateUserPassword(params.userId, body);

    return reply.send(message).code(200);
};

export const userHandler = {
    getUser,
    deleteUser,
    updateUser,
    updateUserPassword,
};
