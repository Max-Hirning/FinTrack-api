import { tokenService } from "./token.service";
import { hashing } from "@/business/lib/hashing";
import { emailService } from "../inform/email.service";
import { Prisma, prisma } from "@/database/prisma/prisma";
import {
    ForbiddenError,
    InternalServerError,
    NotFoundError,
} from "@/business/lib/errors";
import {
    updateUserBody,
    updateUserPasswordBody,
} from "@/business/lib/validation/account/user";

const find = async (query: Prisma.UserWhereInput) => {
    try {
        const user = await prisma.user.findFirstOrThrow({
            where: query,
        });

        return user;
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }
};
const getUser = async (query: Prisma.UserWhereUniqueInput) => {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: query,
            include: {
                images: true,
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

    await tokenService.deleteTokens({
        userId: user.id,
    });

    await emailService.sendDeleteUserEmail(user.email);

    return "Account was removed";
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

        await emailService.sendUpdateUserEmailEmail(user.email);
    }

    return "Account info was updated";
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

    await emailService.sendUpdateUserPasswordEmail(user.email);

    return "Password was updated";
};

export const userService = {
    find,
    getUser,
    updateUser,
    deleteUser,
    updateUserPassword,
};
