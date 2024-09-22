import { environmentVariables } from "@/config";
import { currenciesResponse } from "@/business/lib/validation/currency";

const currencies: currenciesResponse = {
    AUD: {
        id: "AUD",
        title: "Australian Dollar",
        image: `${environmentVariables.API_URL}/assets/flags/au.svg`,
    },
    CAD: {
        id: "CAD",
        title: "Canadian Dollar",
        image: `${environmentVariables.API_URL}/assets/flags/ca.svg`,
    },
    CHF: {
        id: "CHF",
        title: "Swiss Franc",
        image: `${environmentVariables.API_URL}/assets/flags/ch.svg`,
    },
    EUR: {
        id: "EUR",
        title: "Euro",
        image: `${environmentVariables.API_URL}/assets/flags/eu.svg`,
    },
    GBP: {
        id: "GBP",
        title: "Pound Sterling",
        image: `${environmentVariables.API_URL}/assets/flags/gb.svg`,
    },
    JPY: {
        id: "JPY",
        title: "Yen",
        image: `${environmentVariables.API_URL}/assets/flags/jp.svg`,
    },
    PLN: {
        id: "PLN",
        title: "Zloty",
        image: `${environmentVariables.API_URL}/assets/flags/pl.svg`,
    },
    UAH: {
        id: "UAH",
        title: "Hryvnia",
        image: `${environmentVariables.API_URL}/assets/flags/ua.svg`,
    },
    USD: {
        id: "USD",
        title: "US Dollar",
        image: `${environmentVariables.API_URL}/assets/flags/us.svg`,
    },
};

export { currencies };
