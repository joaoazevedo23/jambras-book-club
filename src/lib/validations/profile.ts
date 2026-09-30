import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
  username: z
    .string()
    .min(3, "O username deve ter pelo menos 3 caracteres")
    .optional(),
  bio: z
    .string()
    .max(160, "A biografia não pode exceder 160 caracteres")
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "A palavra-passe atual é obrigatória"),
  newPassword: z
    .string()
    .min(6, "A nova palavra-passe deve ter pelo menos 6 caracteres"),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
