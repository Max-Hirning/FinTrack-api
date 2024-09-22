import axios from "axios";
import { Currencies } from "@prisma/client";
import { environmentVariables } from "@/config";
import { currencies } from "@/business/constants";
import { InternalServerError, NotFoundError } from "@/business/lib/errors";
import {
    currenciesRatesResponse,
    getCurrenciesRatesConfig,
} from "@/business/lib/validation";

const getCurrencies = () => {
    return Object.values(currencies);
};

const getCurrency = (currency: Currencies) => {
    const currencyObj = currencies[currency];
    if (!currencyObj) throw new NotFoundError("No currency was found");
    return currencies[currency];
};

const getCurrenciesRates = async (
    config: getCurrenciesRatesConfig,
): Promise<currenciesRatesResponse> => {
    const { base, start_date, end_date, symbols } = config;
    try {
        const response = await axios.get(
            "https://api.currencybeacon.com/v1/timeseries",
            {
                params: {
                    base,
                    end_date,
                    start_date,
                    symbols: symbols.join(","),
                    api_key: environmentVariables.CURRENCY_API_KEY,
                },
            },
        );
        return response.data.response;
    } catch {
        throw new InternalServerError("Something went wrong");
    }
};
export const currencyService = {
    getCurrency,
    getCurrencies,
    getCurrenciesRates,
};
