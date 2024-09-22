import { tokenService } from "./token.service";
import { hashing } from "@/business/lib/hashing";
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
                cards: true,
                budgets: true,
                loans: true,
                goals: true,
            },
        });

        return {
            ...user,
            dateOfBirth: user.dateOfBirth.toISOString(),
            budgets: user.budgets.map((el) => el.id),
            cards: user.cards.map((el) => el.id),
            loans: user.loans.map((el) => el.id),
            goals: user.goals.map((el) => el.id),
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
    getUser,
    updateUser,
    deleteUser,
    updateUserPassword,
};
