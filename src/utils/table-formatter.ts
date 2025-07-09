/**
 * Represents a row of data for zoom analysis table
 */
export interface TableRow {
  zoom: number;
  maxDistance: number;
  tiltAngle: number;
  lineCount: number;
  focalLength: number;
}

/**
 * Formats table data into markdown and CSV formats
 */
export class TableFormatter {
  /**
   * Formats rows into a markdown table with aligned columns
   * @param rows - Array of table rows to format
   * @returns Formatted markdown table string
   */
  formatMarkdown(rows: TableRow[]): string {
    // Header
    const header = '| Zoom | Max Distance (m) | Tilt Angle (°) | Line Count | Focal Length (mm) |';

    // Separator with right alignment for numeric columns
    const separator =
      '|------|------------------:|----------------:|------------:|--------------------:|';

    // Format rows
    const formattedRows = rows.map((row) => {
      const zoom = this.padRight(this.formatNumber(row.zoom), 4);
      const maxDistance = this.padLeft(this.formatNumber(row.maxDistance), 16);
      const tiltAngle = this.padLeft(this.formatNumber(row.tiltAngle), 14);
      const lineCount = this.padLeft(this.formatNumber(row.lineCount), 10);
      const focalLength = this.padLeft(this.formatNumber(row.focalLength), 17);

      return `| ${zoom} | ${maxDistance} | ${tiltAngle} | ${lineCount} | ${focalLength} |`;
    });

    return [header, separator, ...formattedRows].join('\n');
  }

  /**
   * Formats rows into RFC 4180 compliant CSV format
   * @param rows - Array of table rows to format
   * @returns Formatted CSV string with CRLF line endings
   */
  formatCSV(rows: TableRow[]): string {
    // CSV header
    const header = 'Zoom,Max Distance (m),Tilt Angle (°),Line Count,Focal Length (mm)';

    // Format rows
    const formattedRows = rows.map((row) => {
      return [
        this.formatNumber(row.zoom),
        this.formatNumber(row.maxDistance),
        this.formatNumber(row.tiltAngle),
        this.formatNumber(row.lineCount),
        this.formatNumber(row.focalLength),
      ].join(',');
    });

    // Join with CRLF for RFC 4180 compliance
    const lines = [header, ...formattedRows];
    return lines.join('\r\n');
  }

  /**
   * Formats a number, removing unnecessary decimal zeros
   * @param value - Number to format
   * @returns Formatted string representation
   */
  private formatNumber(value: number): string {
    // Convert to string and remove trailing zeros after decimal point
    const str = value.toString();

    // If it's a whole number represented as decimal (e.g., "2.0"), return just the integer part
    if (str.includes('.') && parseFloat(str) === Math.floor(parseFloat(str))) {
      return Math.floor(value).toString();
    }

    return str;
  }

  /**
   * Pads a string with spaces on the left to reach the specified width
   * @param str - String to pad
   * @param width - Target width
   * @returns Padded string
   */
  private padLeft(str: string, width: number): string {
    const padding = width - str.length;
    if (padding <= 0) return str;
    return ' '.repeat(padding) + str;
  }

  /**
   * Pads a string with spaces on the right to reach the specified width
   * @param str - String to pad
   * @param width - Target width
   * @returns Padded string
   */
  private padRight(str: string, width: number): string {
    const padding = width - str.length;
    if (padding <= 0) return str;
    return str + ' '.repeat(padding);
  }
}
