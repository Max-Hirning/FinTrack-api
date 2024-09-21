import { otpService } from "./otp.service";
import { userService } from "./user.service";
import { fastify } from "@/bootstrap/swagger";
import { IRefreshToken } from "@/types/token";
import { tokenService } from "./token.service";
import { hashing } from "@/business/lib/hashing";
import { prisma } from "@/database/prisma/prisma";
import { emailService } from "../inform/email.service";
import {
    ForbiddenError,
    InternalServerError,
    UnauthorizedError,
} from "@/business/lib/errors";
import {
    CheckOtpBody,
    RefreshTokensBody,
    RequestOtpBody,
    ResetPasswordBody,
    SignInBody,
    SignUpBody,
} from "@/business/lib/validation/account";

const signIn = async (payload: SignInBody) => {
    const user = await userService.getUser({
        email: payload.email,
    });

    if (!user) throw new ForbiddenError("Invalid email");

    const comparedPasses = hashing.comparePassword(
        payload.password,
        user.password,
    );
    if (!comparedPasses) throw new ForbiddenError("Invalid password");

    const tokens = await tokenService.createTokens(user.id);

    return {
        ...tokens,
        user: user,
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
                lastName: payload.lastName,
                firstName: payload.firstName,
            },
        });

        return "Account was created";
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

    const user = await userService.find({ email: payload.email });

    await emailService.sendOtpEmail(user, code);

    return "Otp was sent";
};
const refreshTokens = async (payload: RefreshTokensBody) => {
    const refreshToken: IRefreshToken | null = fastify.jwt.decode(
        payload.refreshToken,
    );

    if (!refreshToken) throw new UnauthorizedError(true);

    try {
        await prisma.refreshToken.findFirstOrThrow({
            where: {
                uuid: refreshToken.uuid,
                userId: refreshToken.userId,
            },
        });
    } catch {
        throw new UnauthorizedError(true);
    }

    const tokens = await tokenService.createTokens(refreshToken.userId);

    return tokens;
};
const resetPassword = async (payload: ResetPasswordBody) => {
    const user = await userService.find({ email: payload.email });

    const response = await userService.updateUserPassword(user.id, {
        password: payload.password,
    });

    await emailService.sendUpdateUserPasswordEmail(user);

    return response;
};

export const authService = {
    signIn,
    signUp,
    checkOtp,
    requestOtp,
    refreshTokens,
    resetPassword,
};
