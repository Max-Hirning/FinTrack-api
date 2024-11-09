import { FastifyReply, FastifyRequest } from "fastify";
import { InternalServerError } from "@/business/lib/errors";
import { fileService } from "@/business/services/file.service";
import { tryCatchApiMiddleware } from "@/business/lib/middleware";

const updateUserAvatar = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const userId = request.user.id;
        const parts = request.parts();
        let fileBuffer;

        for await (const part of parts) {
            if (part.fieldname === "avatar" && part.type === "file") {
                if (part.mimetype.includes("image")) {
                    try {
                        fileBuffer = await part.toBuffer();
                    } catch (error) {
                        throw new InternalServerError((error as Error).message);
                    }
                }
                part.file.resume();
            }
        }

        const data = await fileService.saveProfileAvatar(userId, fileBuffer);

        return {
            data,
            code: 200,
        };
    });
};
const deleteUserAvatar = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    return tryCatchApiMiddleware(reply, async () => {
        const userId = request.user.id;

        const data = await fileService.deleteProfileAvatar(userId);

        return {
            data,
            code: 200,
        };
    });
};

export const fileHandler = {
    updateUserAvatar,
    deleteUserAvatar,
};
