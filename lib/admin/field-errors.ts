import type { z } from "zod";

/** Turns validation issues into { "variants.0.pricePaise": ["Enter a price."] } so forms can show each message next to its field. */
export function issuesToFieldErrors(issues: z.core.$ZodIssue[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
