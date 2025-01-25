import { generateRepository } from "../generate.repository";

export const defaultTransactionSelect = {
    id: true,
    date: true,
    amount: true,
    loanAmount: true,
    goalAmount: true,
    description: true,
    categoryId: true,
    cardId: true,
    goalId: true,
    loanId: true,
};

export const transactionRepository = generateRepository("Transaction");
