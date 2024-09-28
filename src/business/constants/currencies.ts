import { environmentVariables } from "@/config";
import { currenciesResponse } from "@/business/lib/validation/currency";

const currencies: currenciesResponse = {
    AUD: {
        id: "AUD",
        title: "Australian Dollar",
        image: `${environmentVariables.API_URL}/assets/flag/au.svg`,
    },
    CAD: {
        id: "CAD",
        title: "Canadian Dollar",
        image: `${environmentVariables.API_URL}/assets/flag/ca.svg`,
    },
    CHF: {
        id: "CHF",
        title: "Swiss Franc",
        image: `${environmentVariables.API_URL}/assets/flag/ch.svg`,
    },
    EUR: {
        id: "EUR",
        title: "Euro",
        image: `${environmentVariables.API_URL}/assets/flag/eu.svg`,
    },
    GBP: {
        id: "GBP",
        title: "Pound Sterling",
        image: `${environmentVariables.API_URL}/assets/flag/gb.svg`,
    },
    JPY: {
        id: "JPY",
        title: "Yen",
        image: `${environmentVariables.API_URL}/assets/flag/jp.svg`,
    },
    PLN: {
        id: "PLN",
        title: "Zloty",
        image: `${environmentVariables.API_URL}/assets/flag/pl.svg`,
    },
    UAH: {
        id: "UAH",
        title: "Hryvnia",
        image: `${environmentVariables.API_URL}/assets/flag/ua.svg`,
    },
    USD: {
        id: "USD",
        title: "US Dollar",
        image: `${environmentVariables.API_URL}/assets/flag/us.svg`,
    },
};

export { currencies };
