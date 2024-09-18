import { otpService } from "./otp.service";
import { userService } from "./user.service";
import { hashing } from "@/business/lib/hashing";
import { prisma } from "@/database/prisma/prisma";
import { ForbiddenError, InternalServerError } from "@/business/lib/errors";
import {
    CheckOtpBody,
    RefreshTokensBody,
    RequestOtpBody,
    ResetPasswordBody,
    SignInBody,
    SignUpBody,
} from "@/business/lib/validation/account";

const signIn = async (payload: SignInBody) => {
    const user = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });

    if (!user) throw new ForbiddenError("Invalid email");

    const comparedPasses = hashing.comparePassword(
        payload.password,
        user.password,
    );
    if (!comparedPasses) throw new ForbiddenError("Invalid password");

    return {
        user: user,
        accessToken: "",
        refreshToken: "",
    };
};
const signUp = async (payload: SignUpBody) => {
    const user = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });

    if (user) throw new ForbiddenError("User allready exists");

    const cryptedPass = hashing.hashPassword(payload.password);

    try {
        await prisma.user.create({
            data: {
                email: payload.email,
                password: cryptedPass,
                dateOfBirth: new Date(),
                lastName: payload.lastName,
                firstName: payload.firstName,
            },
        });
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const checkOtp = async (payload: CheckOtpBody) => {
    await otpService.checkOtp({ email: payload.email }, payload.code);
    return "Otp is correct";
};
const requestOtp = async (payload: RequestOtpBody) => {
    const code = await otpService.createOtp(payload);
    console.log(code);
    // send to email
    return "Otp was sent";
};
const refreshTokens = async (payload: RefreshTokensBody) => {
    console.log(payload);
    return "Exempli gratia";
};
const resetPassword = async (userId: string, payload: ResetPasswordBody) => {
    return userService.updatePassword(userId, payload.password);
};

export const authService = {
    signIn,
    signUp,
    checkOtp,
    requestOtp,
    refreshTokens,
    resetPassword,
};
