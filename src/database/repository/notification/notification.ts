import { generateRepository } from "../generate.repository";

export const defaultNotificationSelect = {
    id: true,
    title: true,
    message: true,
    isRead: true,
    userId: true,
    budgetId: true,
    loanId: true,
    goalId: true,
    createdAt: true,
    updatedAt: true,
};

export const notificationRepository = generateRepository("Notification");
