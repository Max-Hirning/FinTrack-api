import axios from "axios";
import { Currencies } from "@prisma/client";
import { environmentVariables } from "@/config";
import { currencies } from "@/business/constants";
import { getCurrenciesRatesConfig } from "@/business/lib/validation";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";

const getCurrencies = () => {
    return Object.values(currencies);
};

const getCurrency = (currency: Currencies) => {
    const currencyObj = currencies[currency];
    if (!currencyObj) throw new NotFoundError("No currency was found");
    return currencies[currency];
};

const getCurrentCurrenciesRates = async (
    config: Pick<getCurrenciesRatesConfig, "base" | "symbols">,
): Promise<Record<string, number>> => {
    const { base, symbols } = config;
    try {
        const response = await axios.get(
            "https://api.currencybeacon.com/v1/latest",
            {
                params: {
                    base,
                    symbols: symbols.join(","),
                    api_key: environmentVariables.CURRENCY_API_KEY,
                },
            },
        );
        return response.data.rates;
    } catch {
        throw new InternalServerError("Something went wrong");
    }
};

// const getCurrenciesRates = async (
//     config: getCurrenciesRatesConfig,
// ): Promise<currenciesRatesResponse> => {
//     const { base, start_date, end_date, symbols } = config;

//     const end = parseISO(end_date);
//     const currentDate = new Date();
//     const uniqueSymbols = new Set(symbols);
//     const finalDate = isAfter(end, currentDate) ? currentDate : end;

//     uniqueSymbols.delete(base);

//     try {
//         const response = await axios.get(
//             "https://api.currencybeacon.com/v1/timeseries",
//             {
//                 params: {
//                     base,
//                     start_date,
//                     end_date: format(finalDate, "yyyy-MM-dd"),
//                     symbols: Array.from(uniqueSymbols).join(","),
//                     api_key: environmentVariables.CURRENCY_API_KEY,
//                 },
//             },
//         );
//         return response.data.response;
//     } catch {
//         throw new InternalServerError("Something went wrong");
//     }
// };
export const currencyService = {
    getCurrency,
    getCurrencies,
    // getCurrenciesRates,
    getCurrentCurrenciesRates,
};
