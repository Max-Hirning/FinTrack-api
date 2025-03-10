import { generateRepository } from "../generate.repository";

export const defaultCategorySelect = {
    id: true,
    title: true,
    image: true,
    color: true,
    type: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
};

export const categoryRepository = generateRepository("Category");
