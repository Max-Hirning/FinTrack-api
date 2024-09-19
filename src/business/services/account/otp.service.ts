import { Prisma, prisma } from "@/database/prisma/prisma";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";

const generateOTP = (length: number = 6) => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";

    const characters = uppercase + lowercase + digits;
    let otp = "";

    // Ensure at least one character from each category
    otp += uppercase[Math.floor(Math.random() * uppercase.length)];
    otp += lowercase[Math.floor(Math.random() * lowercase.length)];
    otp += digits[Math.floor(Math.random() * digits.length)];

    // Fill the rest of the OTP length
    for (let i = 3; i < length; i++) {
        otp += characters[Math.floor(Math.random() * characters.length)];
    }

    // Shuffle the OTP to avoid predictable patterns
    otp = otp
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");

    return otp;
};
const createOtp = async (
    userQuery: Prisma.UserWhereUniqueInput,
    count: number = 0,
) => {
    const code = generateOTP();

    const usedOtp = await prisma.otp.findFirst({
        where: {
            otp: code,
        },
    });

    if (count === 10) throw new InternalServerError("Can't send otp");
    if (!usedOtp) createOtp(userQuery, count++);

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
    code: string,
) => {
    try {
        const otp = await prisma.otp.findFirstOrThrow({
            where: {
                otp: code,
                user: userQuery,
            },
        });
        await prisma.otp.deleteMany({
            where: {
                id: otp.id,
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
