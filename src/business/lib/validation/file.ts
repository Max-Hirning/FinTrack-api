import { z } from "zod";

export const fileResponseSchema = z.object({
    id: z.string(),
    url: z.string(),
});

type fileResponse = z.infer<typeof fileResponseSchema>;

export type { fileResponse };
