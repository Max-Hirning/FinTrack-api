import { z } from "zod";

export const exampleQuerySchema = z.object({
    info: z.string().optional(),
});

type ExampleQuery = z.infer<typeof exampleQuerySchema>;

export const exampleResponseSchema = z.object({
    message: z.string(),
});

export type { ExampleQuery };
