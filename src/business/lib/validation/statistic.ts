import { z } from "zod";

export const getStatisticsQueriesSchema = z.object({
    endDate: z.string().date(),
    startDate: z.string().date(),
    userId: z.string().optional(),
    cardIds: z.array(z.string()).optional(),
    loanIds: z.array(z.string()).optional(),
    goalIds: z.array(z.string()).optional(),
    budgetIds: z.array(z.string()).optional(),
    frequency: z.enum(["year", "month", "day"]).optional(),
});

type getStatisticsQueries = z.infer<typeof getStatisticsQueriesSchema>;

export const accountStatisticParamSchema = z.object({
    userId: z.string(),
});

type accountStatisticParam = z.infer<typeof accountStatisticParamSchema>;

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
export const accountStatisticResponseSchema = z.object({
    loans: z.number(),
    budget: z.number(),
    incomes: z.number(),
    expenses: z.number(),
    cashflow: z.number(),
});
export const statisticsListResponseSchema = z.array(statisticsResponseSchema);
export const statisticsListGroupedResponseSchema = z.array(
    statisticsGroupedResponseSchema,
);

type statisticsResponse = z.infer<typeof statisticsResponseSchema>;
type accountStatisticResponse = z.infer<typeof accountStatisticResponseSchema>;
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
    accountStatisticParam,
    statisticsListResponse,
    accountStatisticResponse,
    statisticsGroupedResponse,
    statisticsListGroupedResponse,
};
