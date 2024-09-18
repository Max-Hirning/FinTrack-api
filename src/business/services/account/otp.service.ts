import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";

const createOtp = async (userQuery: Prisma.UserWhereUniqueInput) => {
    const code = "2937";

    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: userQuery,
        });

        await prisma.otp.create({
            data: {
                otp: code,
                userId: user.id,
            },
        });
        return code;
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const checkOtp = async (
    userQuery: Prisma.UserWhereUniqueInput,
    code: string
) => {
    let user;
    try {
        user = await prisma.user.findUniqueOrThrow({
            where: userQuery,
        });
    } catch (error) {
        throw new NotFoundError((error as Error).message);
    }

    try {
        await prisma.otp.findFirstOrThrow({
            where: {
                otp: code,
                userId: user.id,
            },
        });
        return true;
    } catch {
        throw new NotFoundError("Invalid otp");
    }
};

export const otpService = {
    checkOtp,
    createOtp,
};
