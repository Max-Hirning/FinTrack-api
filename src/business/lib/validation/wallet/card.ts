import { z } from "zod";
import { Currencies } from "@prisma/client";
import { userResponseSchema } from "../account/user";

export const getCardsQueriesSchema = z
    .object({
        page: z.number(),
        userIds: z.array(z.string()),
        cardIds: z.array(z.string()),
        currencies: z.array(
            z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
        ),
    })
    .partial()
    .refine(
        (arg) => {
            if (!arg.cardIds && !arg.currencies && !arg.userIds) return true;
        },
        {
            message:
        "At least one of fields: 'userIds', 'cardIds' or 'currencies' is required",
        },
    );

type getCardsQueries = z.infer<typeof getCardsQueriesSchema>;

export const getCardParamSchema = z.object({
    cardId: z.string(),
});
export const deleteCardParamSchema = z.object({
    cardId: z.string(),
});
export const updateCardParamSchema = z.object({
    cardId: z.string(),
});

type getCardParam = z.infer<typeof getCardParamSchema>;
type deleteCardParam = z.infer<typeof deleteCardParamSchema>;
type updateCardParam = z.infer<typeof updateCardParamSchema>;

export const createCardBodySchema = z.object({
    title: z.string(),
    startBalance: z.number(),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
});
export const updateCardBodySchema = createCardBodySchema.partial();

type createCardBody = z.infer<typeof createCardBodySchema>;
type updateCardBody = z.infer<typeof updateCardBodySchema>;

export const cardResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    balance: z.number(),
    currency: z.enum(Object.values(Currencies) as [Currencies, ...Currencies[]]),
    user: userResponseSchema.pick({
        lastName: true,
        firstName: true,
        images: true,
    }),
});
export const cardsListResponseSchema = z.object({
    totalPages: z.number().int(),
    data: z.array(cardResponseSchema),
    prevPage: z.number().int().nullable(),
    nextPage: z.number().int().nullable(),
});

type cardResponse = z.infer<typeof cardResponseSchema>;
type cardsListResponse = z.infer<typeof cardsListResponseSchema>;

export type {
    getCardsQueries,
    getCardParam,
    deleteCardParam,
    updateCardParam,
    createCardBody,
    updateCardBody,
    cardResponse,
    cardsListResponse,
};
