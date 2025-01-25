import { generateRepository } from "../generate.repository";

export const defaultGoalSelect = {
    id: true,
    title: true,
    amount: true,
    balance: true,
    currency: true,
    deadline: true,
    status: true,
    description: true,
    userId: true,
};

export const goalRepository = generateRepository("Goal");
