import { fastify } from "@/bootstrap/swagger";
import { IRefreshToken } from "@/types/token";
import { hashing } from "@/business/lib/hashing";
import { refreshTokenRepository, userRepository } from "@/database";
import {
    otpService,
    tokenService,
    emailService,
    userService,
} from "@/business/services";
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
} from "@/business/lib/validation";

const signIn = async (payload: SignInBody) => {
    const user = await userService.find({
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
    const user = await userRepository.findUnique({
        where: {
            email: payload.email,
        },
    });

    if (user) throw new ForbiddenError("User allready exists");

    try {
        await userRepository.create({
            data: {
                email: payload.email,
                password: payload.password,
                lastName: payload.lastName,
                firstName: payload.firstName,
            },
        });
        return "Account was created";
    } catch (error) {
        throw new InternalServerError((error as Error).message);
    }
};
const preSignUp = async (payload: SignUpBody) => {
    const user = await userRepository.findUnique({
        where: {
            email: payload.email,
        },
    });

    if (user) throw new ForbiddenError("User allready exists");

    return "Success";
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

    const foundRefreshToken = await refreshTokenRepository.findFirst({
        where: {
            uuid: refreshToken.uuid,
            userId: refreshToken.userId,
        },
    });
    if (!foundRefreshToken) throw new UnauthorizedError(true);

    const user = await userService.find({
        id: refreshToken.userId,
    });

    const tokens = await tokenService.createTokens(refreshToken.userId);

    return {
        ...tokens,
        user,
    };
};
const resetPassword = async (payload: ResetPasswordBody) => {
    const { id } = await userService.find({ email: payload.email });

    const user = await userService.updateUserPassword(id, {
        password: payload.password,
    });

    return user;
};

export const authService = {
    signIn,
    signUp,
    checkOtp,
    preSignUp,
    requestOtp,
    refreshTokens,
    resetPassword,
};
