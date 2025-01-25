import { fileService } from "../file.service";
import { hashing } from "@/business/lib/hashing";
import { Prisma } from "@/database/prisma/prisma";
import { tokenService } from "@/business/services";
import { deleteCache } from "@/business/lib/redis";
import { defaultUserSelect, userRepository } from "@/database";
import {
    updateUserBody,
    updateUserPasswordBody,
} from "@/business/lib/validation";
import {
    NotFoundError,
    ForbiddenError,
    InternalServerError,
} from "@/business/lib/errors";

const find = async (query: Prisma.UserWhereUniqueInput) => {
    const user = await userRepository.findFirst({
        where: query,
        select: {
            ...defaultUserSelect,
            images: true,
            cards: true,
            budgets: true,
            loans: true,
            goals: true,
        },
    });
    if (!user) throw new NotFoundError("No user found");
    return user;
};
const deleteUser = async (userId: string) => {
    let user;

    await fileService.deleteProfileAvatar(userId);

    try {
        user = await userRepository.delete({
            where: {
                id: userId,
            },
        });
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    await deleteCache(user.id);

    return user;
};
const updateUser = async (userId: string, payload: updateUserBody) => {
    let user;
    try {
        user = await userRepository.update({
            where: {
                id: userId,
            },
            data: {
                role: payload.role,
                email: payload.email,
                lastName: payload.lastName,
                currency: payload.currency,
                firstName: payload.firstName,
                dateOfBirth: payload.dateOfBirth,
                goalNotification: payload.goalNotification,
                loanNotification: payload.loanNotification,
                budgetNotification: payload.budgetNotification,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }

    if (payload.email) {
        await tokenService.deleteTokens({
            userId: user.id,
        });
    }

    await deleteCache(user.id);

    return user;
};
const updateUserPassword = async (
    userId: string,
    payload: Omit<updateUserPasswordBody, "oldPassword"> &
    Partial<Pick<updateUserPasswordBody, "oldPassword">>,
) => {
    let user;

    if (payload.oldPassword) {
        const user = await find({ id: userId });
        const comparedPasses = hashing.comparePassword(
            payload.oldPassword,
            user.password,
        );
        if (!comparedPasses) throw new ForbiddenError("Invalid old password");
    }

    const cryptedPass = hashing.hashPassword(payload.password);

    try {
        user = await userRepository.update({
            where: {
                id: userId,
            },
            data: {
                password: cryptedPass,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }

    await tokenService.deleteTokens({
        userId: user.id,
    });

    return user;
};

export const userService = {
    find,
    updateUser,
    deleteUser,
    updateUserPassword,
};
