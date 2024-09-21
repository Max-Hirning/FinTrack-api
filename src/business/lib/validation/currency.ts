import { z } from "zod";
import { Currencies } from "@prisma/client";

export const getCurrenciesRatesConfigSchema = z.object({
    end_date: z.string().date(),
    start_date: z.string().date(),
    base: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    symbols: z.array(
        z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    ),
});

type getCurrenciesRatesConfig = z.infer<typeof getCurrenciesRatesConfigSchema>;

export const currencyResponseSchema = z.object({
    title: z.string(),
    image: z.string().url(),
    id: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
});
export const currenciesListResponseSchema = z.array(currencyResponseSchema);
export const currenciesRatesResponseSchema = z.record(
    z.string().date(),
    z.record(z.string(), z.number()),
);
export const currenciesResponseSchema = z.record(
    z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    currencyResponseSchema,
);

type currencyResponse = z.infer<typeof currencyResponseSchema>;
type currenciesResponse = z.infer<typeof currenciesResponseSchema>;
type currenciesListResponse = z.infer<typeof currenciesListResponseSchema>;
type currenciesRatesResponse = z.infer<typeof currenciesRatesResponseSchema>;

export type {
    currenciesResponse,
    currenciesListResponse,
    currencyResponse,
    getCurrenciesRatesConfig,
    currenciesRatesResponse,
};
