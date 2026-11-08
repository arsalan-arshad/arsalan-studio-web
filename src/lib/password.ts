import { z } from "zod";

/** Shown next to password fields on signup / reset. */
export const PASSWORD_RULES_HINT =
  "At least 10 characters, with uppercase, lowercase, a number, and a special character.";

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

const hasLower = /[a-z]/;
const hasUpper = /[A-Z]/;
const hasDigit = /[0-9]/
const hasSpecial = /[^A-Za-z0-9]/

export function passwordStrengthIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) {
    issues.push(`at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    issues.push(`at most ${PASSWORD_MAX_LENGTH} characters`);
  }
  if (!hasLower.test(password)) issues.push("a lowercase letter");
  if (!hasUpper.test(password)) issues.push("an uppercase letter");
  if (!hasDigit.test(password)) issues.push("a number");
  if (!hasSpecial.test(password)) issues.push("a special character");
  return issues;
}

/** Shared Zod helper for signup, reset, and change-password. */
export const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_RULES_HINT)
  .max(PASSWORD_MAX_LENGTH)
  .superRefine((value, ctx) => {
    const issues = passwordStrengthIssues(value);
    if (issues.length) {
      ctx.addIssue({
        code: "custom",
        message: `Password needs ${issues.join(", ")}.`,
      });
    }
  });
