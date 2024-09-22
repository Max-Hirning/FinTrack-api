import { v4 as uuidv4 } from "uuid";
import { fastify } from "@/bootstrap/swagger";
import { environmentVariables } from "@/config";
import { userService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError } from "@/business/lib/errors";

const createTokens = async (userId: string) => {
    const user = await userService.find({
        id: userId,
    });

    try {
        const uuid = uuidv4();
        const accessToken = fastify.jwt.sign(
            { userId: user.id, role: user.role },
            { expiresIn: environmentVariables.ACCESS_TOKEN_EXP },
        );
        const refreshToken = fastify.jwt.sign(
            { userId: user.id, uuid },
            { expiresIn: environmentVariables.REFRESH_TOKEN_EXP },
        );

        await prisma.refreshToken.create({
            data: {
                uuid,
                userId,
                token: refreshToken,
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const deleteTokens = async (query: Prisma.RefreshTokenWhereInput) => {
    try {
        await prisma.refreshToken.deleteMany({
            where: query,
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};

export const tokenService = {
    createTokens,
    deleteTokens,
};
