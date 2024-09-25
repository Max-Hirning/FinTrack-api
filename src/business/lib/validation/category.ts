import { z } from "zod";
import { Categories } from "@prisma/client";

export const getCategoriesQueriesSchema = z.object({
    grouped: z.boolean().optional(),
});

type getCategoriesQueries = z.infer<typeof getCategoriesQueriesSchema>;

export const categoryChildSchema = z.object({
    title: z.string(),
    color: z.string(),
    image: z.string().url(),
    id: z.nativeEnum(Categories),
    group: z.nativeEnum(Categories),
});
export const categoryResponseSchema = z.object({
    color: z.string(),
    title: z.string(),
    image: z.string().url(),
    id: z.nativeEnum(Categories),
    children: z.array(categoryChildSchema),
});
export const categoriesGroupsSchema = z.array(categoryResponseSchema);
export const categoriesChildSchema = z.array(
    categoryChildSchema.omit({
        group: true,
    }),
);
export const categoryGroupChildResponseSchema = categoryResponseSchema
    .omit({
        color: true,
        children: true,
    })
    .extend({
        group: z.nativeEnum(Categories).optional(),
    });
export const categoriesGroupsResponseSchema = z.record(
    z.nativeEnum(Categories),
    categoryResponseSchema,
);
export const categoriesGroupsChildResponseSchema = z.record(
    z.nativeEnum(Categories),
    categoryGroupChildResponseSchema,
);

type categoryResponse = z.infer<typeof categoryResponseSchema>;
type categoriesGroupsResponse = z.infer<typeof categoriesGroupsResponseSchema>;
type categoryGroupChildResponse = z.infer<
  typeof categoryGroupChildResponseSchema
>;
type categoriesGroupsChildResponse = z.infer<
  typeof categoriesGroupsChildResponseSchema
>;

export type {
    categoryResponse,
    getCategoriesQueries,
    categoriesGroupsResponse,
    categoryGroupChildResponse,
    categoriesGroupsChildResponse,
};
