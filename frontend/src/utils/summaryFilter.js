/**
 * Cleans, validates, and filters article summaries.
 * - Removes repeating date loops and repetitive phrases.
 * - Prevents any string/number from repeating consecutively more than 2 times.
 * - Enforces a minimum length of 50 words (returns fallback if shorter).
 */
export function cleanSummary(text) {
  const fallbackMessage = "No summary is available for this article at this time. Click the original article link below to read the full coverage.";

  if (!text || typeof text !== "string") {
    return fallbackMessage;
  }

  let cleaned = text;

  // 1. Remove repeating date patterns like "2021 07 09. 2021 07 09..."
  const dateLoopRegex = /(\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{4}\s\d{2}\s\d{2})\b\.?\s*){3,}/g;
  cleaned = cleaned.replace(dateLoopRegex, "");

  // 2. Prevent any word or number phrase from repeating consecutively more than 2 times
  // Matches any sequence of characters after spaces that repeats 3+ times in a row
  const consecutiveRepeatRegex = /(\b[\w\s.-]+?\b)(?:\s+\1){2,}/gi;
  cleaned = cleaned.replace(consecutiveRepeatRegex, "$1");

  // 3. Remove general repeating sentences
  const repetitiveSentenceRegex = /([^.!?]+[.!?])\s*(?:\1\s*){2,}/gi;
  cleaned = cleaned.replace(repetitiveSentenceRegex, "$1");

  // 4. Clean up trailing fragments and normalize spacing
  cleaned = cleaned.replace(/(?:\b\d{4}\s\d{2}\s\d{2}\.?\s*)+$/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 5. VALIDATION: Check minimum word count (must be at least 50 words)
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 50) {
    return fallbackMessage;
  }

  return cleaned;
}