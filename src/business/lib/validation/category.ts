import { z } from "zod";
import { CategoryType } from "@prisma/client";

export const getCategoriesQueriesSchema = z.object({
    userIds: z.array(z.string()).optional(),
    type: z
        .enum(Object.values(CategoryType) as [CategoryType, ...CategoryType[]])
        .optional(),
});

type getCategoriesQueries = z.infer<typeof getCategoriesQueriesSchema>;

export const deleteCategoryParamSchema = z.object({
    categoryId: z.string(),
});
export const updateCategoryParamSchema = z.object({
    categoryId: z.string(),
});

type deleteCategoryParam = z.infer<typeof deleteCategoryParamSchema>;
type updateCategoryParam = z.infer<typeof updateCategoryParamSchema>;

export const createCategoryBodySchema = z.object({
    title: z.string(),
    color: z.string(),
    imageId: z.string(),
    type: z.enum(
    Object.values(CategoryType) as [CategoryType, ...CategoryType[]],
    ),
});
export const updateCategoryBodySchema = createCategoryBodySchema.partial();

type createCategoryBody = z.infer<typeof createCategoryBodySchema>;
type updateCategoryBody = z.infer<typeof updateCategoryBodySchema>;

export const categoryResponseSchema = z.object({
    id: z.string(),
    title: z.string(),
    color: z.string(),
    image: z.string().url(),
    type: z.enum(
    Object.values(CategoryType) as [CategoryType, ...CategoryType[]],
    ),
});
export const categoriesResponseSchema = z.array(categoryResponseSchema);

type categoryResponse = z.infer<typeof categoryResponseSchema>;
type categoriesResponse = z.infer<typeof categoriesResponseSchema>;

export type {
    categoryResponse,
    categoriesResponse,
    createCategoryBody,
    updateCategoryBody,
    deleteCategoryParam,
    updateCategoryParam,
    getCategoriesQueries,
};
