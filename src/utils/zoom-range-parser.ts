/**
 * Result type for successful zoom range parsing
 */
export interface ZoomRangeSuccess {
  success: true;
  values: number[];
}

/**
 * Result type for failed zoom range parsing
 */
export interface ZoomRangeError {
  success: false;
  error: string;
}

/**
 * Combined result type for zoom range parsing
 */
export type ZoomRangeResult = ZoomRangeSuccess | ZoomRangeError;

/**
 * Parses a zoom range string into an array of zoom values.
 *
 * Supported formats:
 * - Single value: "5" � [5]
 * - Range: "1-5" � [1, 2, 3, 4, 5]
 * - Comma-separated: "1,3,5" � [1, 3, 5]
 * - Mixed: "1-3,5,7-9" � [1, 2, 3, 5, 7, 8, 9]
 *
 * @param input - The zoom range string to parse
 * @returns A result object with either values array or error message
 */
export function parseZoomRange(input: string): ZoomRangeResult {
  // Trim whitespace
  const trimmed = input.trim();

  // Handle empty input
  if (!trimmed) {
    return { success: false, error: 'Empty input' };
  }

  // Handle edge cases with only commas
  if (trimmed === ',') {
    return { success: false, error: 'Invalid format' };
  }

  const values: number[] = [];

  // Split by comma and process each part
  const parts = trimmed.split(',');

  for (const part of parts) {
    const trimmedPart = part.trim();

    // Skip empty parts (from leading/trailing commas)
    if (!trimmedPart) {
      continue;
    }

    // Check if it's a range (contains dash, but not just a negative number)
    if (trimmedPart.includes('-') && !/^-?\d+$/.test(trimmedPart)) {
      // Handle range
      const rangeParts = trimmedPart.split('-');

      // Special handling for negative numbers in ranges like "-2-3"
      let startStr: string;
      let endStr: string;

      if (rangeParts.length === 3 && rangeParts[0] === '') {
        // This is "-X-Y" format where X is meant to be negative
        startStr = '-' + rangeParts[1].trim();
        endStr = rangeParts[2].trim();
      } else if (rangeParts.length === 2) {
        startStr = rangeParts[0].trim();
        endStr = rangeParts[1].trim();
      } else {
        return { success: false, error: `Invalid range format: ${trimmedPart}` };
      }

      // Check for empty range parts
      if (!startStr || !endStr) {
        return { success: false, error: `Invalid range format: ${trimmedPart}` };
      }

      // Parse range start and end
      const start = parseInteger(startStr);
      const end = parseInteger(endStr);

      if (start === null) {
        return { success: false, error: `Invalid number: ${startStr}` };
      }

      if (end === null) {
        return { success: false, error: `Invalid number: ${endStr}` };
      }

      // Validate range values
      if (start < 1) {
        return { success: false, error: 'Zoom values must be >= 1' };
      }

      if (end < 1) {
        return { success: false, error: 'Zoom values must be >= 1' };
      }

      // Check range order
      if (start > end) {
        return { success: false, error: 'Invalid range: start must be <= end' };
      }

      // Add all values in range
      for (let i = start; i <= end; i++) {
        values.push(i);
      }
    } else {
      // Handle single value
      const value = parseInteger(trimmedPart);

      if (value === null) {
        return { success: false, error: `Invalid number: ${trimmedPart}` };
      }

      // Validate value
      if (value < 1) {
        return { success: false, error: 'Zoom values must be >= 1' };
      }

      values.push(value);
    }
  }

  // Deduplicate and sort
  const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);

  return { success: true, values: uniqueValues };
}

/**
 * Helper function to parse an integer, returning null if invalid
 */
function parseInteger(str: string): number | null {
  // Check if string contains only digits (and optional leading minus)
  if (!/^-?\d+$/.test(str)) {
    return null;
  }

  const num = parseInt(str, 10);

  // Check for NaN (shouldn't happen with regex check, but be safe)
  if (isNaN(num)) {
    return null;
  }

  return num;
}
