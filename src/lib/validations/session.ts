import { z } from "zod";

export const readingSessionSchema = z
  .object({
    mode: z.enum(["PAGES", "CHAPTERS"]),
    startPage: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0).optional(),
    ),
    endPage: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0).optional(),
    ),
    startChapter: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0).optional(),
    ),
    endChapter: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0).optional(),
    ),
    rating: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(1).max(10).optional(),
    ),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "PAGES") {
      if (
        data.endPage !== undefined &&
        data.startPage !== undefined &&
        data.endPage < data.startPage
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A página final não pode ser menor que a inicial",
          path: ["endPage"],
        });
      }
    } else {
      if (
        data.endChapter !== undefined &&
        data.startChapter !== undefined &&
        data.endChapter < data.startChapter
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O capítulo final não pode ser menor que o inicial",
          path: ["endChapter"],
        });
      }
    }
  });

export type ReadingSessionFormData = z.infer<typeof readingSessionSchema>;
