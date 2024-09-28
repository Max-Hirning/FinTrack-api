import { z } from "zod";

export const getStatisticsQueriesSchema = z.object({
    endDate: z.string().date(),
    cardIds: z.array(z.string()),
    startDate: z.string().date(),
    userId: z.string().optional(),
});

type getStatisticsQueries = z.infer<typeof getStatisticsQueriesSchema>;

export const statisticsResponseSchema = z.object({
    incomes: z.number(),
    expenses: z.number(),
    date: z.string().date(),
});
export const statisticsGroupedResponseSchema = z.object({
    fill: z.string(),
    title: z.string(),
    value: z.number(),
});
export const statisticsListResponseSchema = z.array(statisticsResponseSchema);
export const statisticsListGroupedResponseSchema = z.array(
    statisticsGroupedResponseSchema,
);

type statisticsResponse = z.infer<typeof statisticsResponseSchema>;
type statisticsGroupedResponse = z.infer<
  typeof statisticsGroupedResponseSchema
>;
type statisticsListResponse = z.infer<typeof statisticsListResponseSchema>;
type statisticsListGroupedResponse = z.infer<
  typeof statisticsListGroupedResponseSchema
>;

export type {
    statisticsResponse,
    getStatisticsQueries,
    statisticsListResponse,
    statisticsGroupedResponse,
    statisticsListGroupedResponse,
};
