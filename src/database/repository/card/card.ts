import { generateRepository } from "../generate.repository";

export const defaultCardSelect = {
    id: true,
    title: true,
    balance: true,
    currency: true,
    startBalance: true,
    color: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
};

export const cardRepository = generateRepository("Card");
