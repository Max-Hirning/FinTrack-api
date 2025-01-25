import { generateRepository } from "../generate.repository";

export const defaultOtpSelect = {
    id: true,
    otp: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
};

export const otpRepository = generateRepository("Otp");
