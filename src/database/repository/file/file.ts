import { generateRepository } from "../generate.repository";

export const defaultFileSelect = {
    id: true,
    url: true,
    type: true,
    fileId: true,
    userId: true,
};

export const fileRepository = generateRepository("File");
