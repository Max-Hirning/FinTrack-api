import { generateRepository } from "../generate.repository";

export const defaultFileSelect = {
    id: true,
    url: true,
    type: true,
    fileId: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
};

export const fileRepository = generateRepository("File");
