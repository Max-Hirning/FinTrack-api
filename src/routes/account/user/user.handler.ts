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

const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: getUserParam }>;
        return userService.getUser({ id: params.userId });
    });
};
const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params } = request as FastifyRequest<{ Params: deleteUserParam }>;
        return userService.deleteUser({ id: params.userId });
    });
};
const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateUserParam;
      Body: updateUserBody;
    }>;
        return userService.updateUser(params.userId, body);
    });
};
const updateUserPassword = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const { params, body } = request as FastifyRequest<{
      Params: updateUserPasswordParam;
      Body: updateUserPasswordBody;
    }>;
        return userService.updateUserPassword(params.userId, body);
    });
};

export const userHandler = {
    getUser,
    deleteUser,
    updateUser,
    updateUserPassword,
};
