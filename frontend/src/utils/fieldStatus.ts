import type { FormData } from "@/types/investigation";

export type FieldStatus = "ai" | "edited" | "none";

/** Compare the AI draft with the current value to choose the field's tag. */
export function fieldStatus(
  field: keyof FormData,
  current: FormData,
  aiFields: FormData | undefined,
  editedFields: string[],
): FieldStatus {
  if (editedFields.includes(field)) return "edited";
  if (!aiFields || aiFields[field] == null) return "none";
  return aiFields[field] === (current[field] ?? null) ? "ai" : "edited";
}
