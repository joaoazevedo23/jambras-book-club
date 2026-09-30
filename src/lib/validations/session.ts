import { z } from "zod";

const parseNumber = (val: unknown) => {
  if (val === "" || val === undefined || val === null) return undefined;
  const parsed = Number(val);
  return isNaN(parsed) ? undefined : parsed;
};

export const readingSessionSchema = z
  .object({
    mode: z.enum(["PAGES", "CHAPTERS"]),
    startPage: z.preprocess(
      parseNumber,
      z.number().min(0, "Mínimo 0").optional(),
    ),
    endPage: z.preprocess(
      parseNumber,
      z.number().min(0, "Mínimo 0").optional(),
    ),
    startChapter: z.preprocess(
      parseNumber,
      z.number().min(0, "Mínimo 0").optional(),
    ),
    endChapter: z.preprocess(
      parseNumber,
      z.number().min(0, "Mínimo 0").optional(),
    ),
    rating: z.preprocess(
      parseNumber,
      z.number().min(1, "Mínimo 1").max(10, "Máximo 10").optional(),
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
