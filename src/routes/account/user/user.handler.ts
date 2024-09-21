import { FastifyReply, FastifyRequest } from "fastify";
import { userService } from "@/business/services/account";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";
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
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request;
        return userService.getUser({ id: params.userId });
    });
};
const deleteUser = async (
    request: FastifyRequest<{ Params: deleteUserParam }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request;
        return userService.deleteUser({ id: params.userId });
    });
};
const updateUser = async (
    request: FastifyRequest<{ Params: updateUserParam; Body: updateUserBody }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request;
        return userService.updateUser(params.userId, body);
    });
};
const updateUserPassword = async (
    request: FastifyRequest<{
    Params: updateUserPasswordParam;
    Body: updateUserPasswordBody;
  }>,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request;
        return userService.updateUserPassword(params.userId, body);
    });
};

export const userHandler = {
    getUser,
    deleteUser,
    updateUser,
    updateUserPassword,
};
