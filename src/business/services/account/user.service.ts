import { hashing } from "@/business/lib/hashing";
import { tokenService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import {
    updateUserBody,
    updateUserPasswordBody,
} from "@/business/lib/validation";
import {
    ForbiddenError,
    InternalServerError,
    NotFoundError,
} from "@/business/lib/errors";

const find = async (query: Prisma.UserWhereUniqueInput) => {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: query,
            include: {
                images: true,
                cards: true,
                budgets: true,
                loans: true,
                goals: true,
            },
        });
        return {
            ...user,
            dateOfBirth: user.dateOfBirth.toISOString(),
        };
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const deleteUser = async (query: Prisma.UserWhereUniqueInput) => {
    let user;

    try {
        user = await prisma.user.delete({
            where: query,
        });
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    try {
        await tokenService.deleteTokens({
            userId: user.id,
        });
    } catch (error) {
        console.log(error);
    }

    return user;
};
const updateUser = async (userId: string, payload: updateUserBody) => {
    let user;
    try {
        user = await prisma.user.update({
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
        user = await prisma.user.update({
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
