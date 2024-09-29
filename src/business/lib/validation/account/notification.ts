import { z } from "zod";

export const getNotificationsQueiresSchema = z.object({
    page: z.number(),
});

type getNotificationsQueires = z.infer<typeof getNotificationsQueiresSchema>;

export const notificationResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    isRead: z.string(),
    userId: z.string(),
    message: z.string(),
    loanId: z.string().nullable(),
    goalId: z.string().nullable(),
    budgetId: z.string().nullable(),
});
export const notificationListResponseSchema = z.object({
    totalPages: z.number().int(),
    data: z.array(notificationResponseSchema),
    prevPage: z.number().int().nullable(),
    nextPage: z.number().int().nullable(),
});

type notificationResponse = z.infer<typeof notificationResponseSchema>;
type notificationListResponse = z.infer<typeof notificationListResponseSchema>;

export type {
    notificationResponse,
    getNotificationsQueires,
    notificationListResponse,
};
