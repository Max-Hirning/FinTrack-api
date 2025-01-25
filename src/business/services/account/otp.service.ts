import { otpRepository } from "@/database";
import { userService } from "@/business/services";
import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";

const generateOTP = (length: number = 6) => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";

    const characters = uppercase + lowercase + digits;
    let otp = "";

    otp += uppercase[Math.floor(Math.random() * uppercase.length)];
    otp += lowercase[Math.floor(Math.random() * lowercase.length)];
    otp += digits[Math.floor(Math.random() * digits.length)];

    for (let i = 3; i < length; i++) {
        otp += characters[Math.floor(Math.random() * characters.length)];
    }

    otp = otp
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");

    return otp;
};
const createOtp = async (userQuery: Prisma.UserWhereUniqueInput) => {
    const code = generateOTP();

    const usedOtp = await otpRepository.findFirst({
        where: {
            otp: code,
        },
    });

    if (usedOtp) throw new InternalServerError("Can't send otp");

    const user = await userService.find(userQuery);

    try {
        await otpRepository.create({
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
    code: string,
) => {
    const otp = await otpRepository.findFirst({
        where: {
            otp: code,
            user: userQuery,
        },
    });
    if (!otp) throw new NotFoundError("Invalid otp");

    await prisma.otp.deleteMany({
        where: {
            id: otp.id,
        },
    });

    return "Otp is verified";
};
const deleteOtps = async (query: Prisma.OtpWhereInput) => {
    try {
        await prisma.otp.deleteMany({
            where: query,
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};

export const otpService = {
    checkOtp,
    createOtp,
    deleteOtps,
};
