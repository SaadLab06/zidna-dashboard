import { z } from "zod";

export const searchSchema = z.string()
  .max(200, "Search term too long")
  .regex(/^[a-zA-Z0-9\s\-_@.]*$/, "Invalid characters in search");

export const validateSearch = (input: string): { success: boolean; data?: string; error?: string } => {
  const result = searchSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }
  return { success: true, data: result.data };
};
