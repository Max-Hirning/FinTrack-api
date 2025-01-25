import { generateRepository } from "../generate.repository";

export const defaultBudgetSelect = {
    id: true,
    title: true,
    balance: true,
    amount: true,
    currency: true,
    period: true,
    startDate: true,
    endDate: true,
    userId: true,
};

export const budgetRepository = generateRepository("Budget");
