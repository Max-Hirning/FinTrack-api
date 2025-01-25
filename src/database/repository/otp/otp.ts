import { generateRepository } from "../generate.repository";

export const defaultOtpSelect = {
    id: true,
    otp: true,
    userId: true,
};

export const otpRepository = generateRepository("Otp");
