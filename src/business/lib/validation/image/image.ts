import { z } from "zod";

export const imageResponseSchema = z.object({
    id: z.string(),
    url: z.string(),
});

type imageResponse = z.infer<typeof imageResponseSchema>;

export type { imageResponse };
