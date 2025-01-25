import { generateRepository } from "../generate.repository";

export const defaultLoanSelect = {
    id: true,
    title: true,
    amount: true,
    balance: true,
    deadline: true,
    currency: true,
    status: true,
    date: true,
    description: true,
    userId: true,
};

export const loanRepository = generateRepository("Loan");
