/**
 * Encodes a database ID into a numeric string with a check digit.
 * Format: [ID][CheckDigit]
 * CheckDigit = sum of digits of ID % 9
 */
export const SUB_PLAYLIST_OFFSET = 1000000;

export function encodeSelectionId(id: number): string {
  const idStr = id.toString();
  let sum = 0;
  for (let i = 0; i < idStr.length; i++) {
    sum += parseInt(idStr[i]);
  }
  const checkDigit = sum % 9;
  return `${idStr}${checkDigit}`;
}

/**
 * Decodes a selection ID string back into a database ID.
 * Returns null if the check digit is invalid.
 */
export function decodeSelectionId(encodedId: string): number | null {
  if (encodedId.length < 2) return null;
  
  const idStr = encodedId.slice(0, -1);
  const checkDigit = parseInt(encodedId.slice(-1));
  const id = parseInt(idStr);
  
  if (isNaN(id) || isNaN(checkDigit)) return null;
  
  let sum = 0;
  for (let i = 0; i < idStr.length; i++) {
    sum += parseInt(idStr[i]);
  }
  
  if (sum % 9 !== checkDigit) return null;
  
  return id;
}

/**
 * Parses various formats of X/Twitter account inputs into a standard X URL.
 * Examples: "@user", "https://x.com/user", "user" -> "https://x.com/user"
 */
export function parseXAccountUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // 1. Extract from URL (x.com or twitter.com)
  const urlMatch = trimmed.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/i);
  if (urlMatch && urlMatch[1]) {
    return `https://x.com/${urlMatch[1]}`;
  }
  
  // 2. Extract from @username or plain username
  // Match valid X usernames (alphanumeric and underscores)
  const atMatch = trimmed.match(/^@?([a-zA-Z0-9_]+)$/);
  if (atMatch && atMatch[1]) {
    return `https://x.com/${atMatch[1]}`;
  }
  
  return null;
}
