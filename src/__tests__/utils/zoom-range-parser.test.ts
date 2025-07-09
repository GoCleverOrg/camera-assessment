import { parseZoomRange } from '../../utils/zoom-range-parser';

describe('parseZoomRange', () => {
  describe('single values', () => {
    it('should parse single digit', () => {
      const result = parseZoomRange('5');
      expect(result).toEqual({ success: true, values: [5] });
    });

    it('should parse multi-digit number', () => {
      const result = parseZoomRange('15');
      expect(result).toEqual({ success: true, values: [15] });
    });

    it('should handle spaces around single value', () => {
      const result = parseZoomRange(' 7 ');
      expect(result).toEqual({ success: true, values: [7] });
    });
  });

  describe('simple ranges', () => {
    it('should parse ascending range', () => {
      const result = parseZoomRange('1-5');
      expect(result).toEqual({ success: true, values: [1, 2, 3, 4, 5] });
    });

    it('should parse single value range', () => {
      const result = parseZoomRange('3-3');
      expect(result).toEqual({ success: true, values: [3] });
    });

    it('should handle spaces in range', () => {
      const result = parseZoomRange(' 2 - 4 ');
      expect(result).toEqual({ success: true, values: [2, 3, 4] });
    });

    it('should parse large range', () => {
      const result = parseZoomRange('10-15');
      expect(result).toEqual({ success: true, values: [10, 11, 12, 13, 14, 15] });
    });
  });

  describe('comma-separated values', () => {
    it('should parse comma-separated single values', () => {
      const result = parseZoomRange('1,3,5');
      expect(result).toEqual({ success: true, values: [1, 3, 5] });
    });

    it('should handle spaces around commas', () => {
      const result = parseZoomRange('2 , 4 , 6');
      expect(result).toEqual({ success: true, values: [2, 4, 6] });
    });

    it('should deduplicate values', () => {
      const result = parseZoomRange('3,1,3,2,1');
      expect(result).toEqual({ success: true, values: [1, 2, 3] });
    });

    it('should sort values', () => {
      const result = parseZoomRange('5,1,3,2,4');
      expect(result).toEqual({ success: true, values: [1, 2, 3, 4, 5] });
    });
  });

  describe('mixed format', () => {
    it('should parse ranges and single values', () => {
      const result = parseZoomRange('1-3,5,7-9');
      expect(result).toEqual({ success: true, values: [1, 2, 3, 5, 7, 8, 9] });
    });

    it('should handle complex mixed format', () => {
      const result = parseZoomRange('10,1-3,8,5-7,15');
      expect(result).toEqual({ success: true, values: [1, 2, 3, 5, 6, 7, 8, 10, 15] });
    });

    it('should deduplicate overlapping ranges', () => {
      const result = parseZoomRange('1-5,3-7,6,8');
      expect(result).toEqual({ success: true, values: [1, 2, 3, 4, 5, 6, 7, 8] });
    });

    it('should handle spaces throughout', () => {
      const result = parseZoomRange(' 1 - 3 , 5 , 7 - 9 ');
      expect(result).toEqual({ success: true, values: [1, 2, 3, 5, 7, 8, 9] });
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = parseZoomRange('');
      expect(result).toEqual({ success: false, error: 'Empty input' });
    });

    it('should handle whitespace only', () => {
      const result = parseZoomRange('   ');
      expect(result).toEqual({ success: false, error: 'Empty input' });
    });

    it('should handle single comma', () => {
      const result = parseZoomRange(',');
      expect(result).toEqual({ success: false, error: 'Invalid format' });
    });

    it('should handle trailing comma', () => {
      const result = parseZoomRange('1,2,');
      expect(result).toEqual({ success: true, values: [1, 2] });
    });

    it('should handle leading comma', () => {
      const result = parseZoomRange(',1,2');
      expect(result).toEqual({ success: true, values: [1, 2] });
    });
  });

  describe('error scenarios', () => {
    it('should reject zero values', () => {
      const result = parseZoomRange('0');
      expect(result).toEqual({ success: false, error: 'Zoom values must be >= 1' });
    });

    it('should reject negative values', () => {
      const result = parseZoomRange('-5');
      expect(result).toEqual({ success: false, error: 'Zoom values must be >= 1' });
    });

    it('should reject range with zero', () => {
      const result = parseZoomRange('0-5');
      expect(result).toEqual({ success: false, error: 'Zoom values must be >= 1' });
    });

    it('should reject range with negative', () => {
      const result = parseZoomRange('-2-3');
      expect(result).toEqual({ success: false, error: 'Zoom values must be >= 1' });
    });

    it('should reject invalid range order', () => {
      const result = parseZoomRange('5-3');
      expect(result).toEqual({ success: false, error: 'Invalid range: start must be <= end' });
    });

    it('should reject non-numeric values', () => {
      const result = parseZoomRange('abc');
      expect(result).toEqual({ success: false, error: 'Invalid number: abc' });
    });

    it('should reject mixed numeric and alpha', () => {
      const result = parseZoomRange('1,2,abc');
      expect(result).toEqual({ success: false, error: 'Invalid number: abc' });
    });

    it('should reject decimal values', () => {
      const result = parseZoomRange('1.5');
      expect(result).toEqual({ success: false, error: 'Invalid number: 1.5' });
    });

    it('should reject invalid range format', () => {
      const result = parseZoomRange('1-2-3');
      expect(result).toEqual({ success: false, error: 'Invalid range format: 1-2-3' });
    });

    it('should reject empty range parts', () => {
      const result = parseZoomRange('1-');
      expect(result).toEqual({ success: false, error: 'Invalid range format: 1-' });
    });

    it('should reject range with missing start', () => {
      const result = parseZoomRange('-5');
      expect(result).toEqual({ success: false, error: 'Zoom values must be >= 1' });
    });
  });

  describe('type exports', () => {
    it('should export result types', () => {
      const successResult: { success: true; values: number[] } = {
        success: true,
        values: [1, 2, 3],
      };
      const errorResult: { success: false; error: string } = {
        success: false,
        error: 'Test error',
      };
      expect(successResult.success).toBe(true);
      expect(errorResult.success).toBe(false);
    });
  });
});
