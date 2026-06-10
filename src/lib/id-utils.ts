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
