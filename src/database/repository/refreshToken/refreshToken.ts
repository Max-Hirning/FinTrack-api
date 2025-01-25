import { generateRepository } from "../generate.repository";

export const defaultRefreshTokenSelect = {
    id: true,
    token: true,
    uuid: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
};

export const refreshTokenRepository = generateRepository("RefreshToken");
