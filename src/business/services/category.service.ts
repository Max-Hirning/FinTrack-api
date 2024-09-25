import { Currencies } from "@prisma/client";
import { currencies } from "@/business/constants";
import { NotFoundError } from "@/business/lib/errors";
import { getCategoriesQueries } from "../lib/validation";
import {
    transactionCategories,
    transactionCategoriesGroups,
} from "../constants/categories";

const getCategory = (currency: Currencies) => {
    const currencyObj = currencies[currency];
    if (!currencyObj) throw new NotFoundError("No category was found");
    return currencies[currency];
};
const getCategories = (queries: getCategoriesQueries) => {
    if (queries.grouped) {
        const categoryGroups = transactionCategoriesGroups;
        const categories = Object.values(transactionCategories);
        const categoryGroupsKeys = Object.keys(transactionCategoriesGroups);

        const response = categories.reduce((res, el) => {
            if (el.group && categoryGroupsKeys.includes(el.group)) {
                if (res[el.group]?.children) {
                    res[el.group]?.children.push({
                        ...el,
                        color: categoryGroups[el.group]?.color || "gray",
                        group: el.group ?? "",
                    });
                }
            } else {
                res[el.id] = {
                    ...el,
                    color: "gray",
                    children: [],
                };
            }
            return res;
        }, categoryGroups);

        return Object.values(response);
    }

    return Object.values(transactionCategories).map((el) => ({
        ...el,
        color: el.group
            ? transactionCategoriesGroups[el.group]?.color || "gray"
            : "gray",
        group: el.group ?? "defaultGroup",
    }));
};

export const categoryService = {
    getCategory,
    getCategories,
};
