import { generateRepository } from "../generate.repository";

export const defaultUserSelect = {
    id: true,
    email: true,
    lastName: true,
    firstName: true,
    password: true,
    loanNotification: true,
    budgetNotification: true,
    goalNotification: true,
    dateOfBirth: true,
    role: true,
    currency: true,
};

export const userRepository = generateRepository("User");
