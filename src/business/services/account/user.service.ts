import { hashing } from "@/business/lib/hashing";
import { Prisma, prisma } from "@/database/prisma/prisma";
import {
    ForbiddenError,
    InternalServerError,
    NotFoundError,
} from "@/business/lib/errors";

const get = async (query: Prisma.UserWhereInput) => {
    try {
        const user = await prisma.user.findFirstOrThrow({
            where: query,
        });
        return user;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};

const updatePassword = async (
    userId: string,
    password: string,
    olPassword?: string
) => {
    if (olPassword) {
        const user = await get({ id: userId });

        const comparedPasses = hashing.comparePassword(
            olPassword,
            user.password
        );
        if (!comparedPasses) throw new ForbiddenError("Invalid old password");
    }

    const cryptedPass = hashing.hashPassword(password);

    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: cryptedPass,
            },
        });
        // send email
        return "Password was updated";
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};

export const userService = {
    get,
    updatePassword,
};
