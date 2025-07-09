import { TableFormatter, TableRow } from '../../utils/table-formatter';

describe('TableFormatter', () => {
  let formatter: TableFormatter;

  beforeEach(() => {
    formatter = new TableFormatter();
  });

  describe('formatMarkdown', () => {
    it('should format a simple table with header alignment', () => {
      const rows: TableRow[] = [
        {
          zoom: 1,
          maxDistance: 2.5,
          tiltAngle: 45.5,
          lineCount: 25,
          focalLength: 10.5,
        },
        {
          zoom: 2,
          maxDistance: 5.0,
          tiltAngle: 35.2,
          lineCount: 50,
          focalLength: 21.0,
        },
      ];

      const result = formatter.formatMarkdown(rows);

      expect(result).toContain(
        '| Zoom | Max Distance (m) | Tilt Angle (°) | Line Count | Focal Length (mm) |',
      );
      expect(result).toContain(
        '|------|------------------:|----------------:|------------:|--------------------:|',
      );
      expect(result).toContain(
        '| 1    |              2.5 |           45.5 |         25 |              10.5 |',
      );
      expect(result).toContain(
        '| 2    |                5 |           35.2 |         50 |                21 |',
      );
    });

    it('should handle decimal values correctly', () => {
      const rows: TableRow[] = [
        {
          zoom: 1.5,
          maxDistance: 3.75,
          tiltAngle: 40.333,
          lineCount: 38,
          focalLength: 15.75,
        },
      ];

      const result = formatter.formatMarkdown(rows);

      expect(result).toContain(
        '| 1.5  |             3.75 |         40.333 |         38 |             15.75 |',
      );
    });

    it('should handle empty data', () => {
      const rows: TableRow[] = [];
      const result = formatter.formatMarkdown(rows);

      expect(result).toContain(
        '| Zoom | Max Distance (m) | Tilt Angle (°) | Line Count | Focal Length (mm) |',
      );
      expect(result).toContain(
        '|------|------------------:|----------------:|------------:|--------------------:|',
      );
      expect(result.split('\n').filter((line: string) => line.trim()).length).toBe(2);
    });

    it('should handle large values', () => {
      const rows: TableRow[] = [
        {
          zoom: 25,
          maxDistance: 62.5,
          tiltAngle: 12.8,
          lineCount: 625,
          focalLength: 262.5,
        },
      ];

      const result = formatter.formatMarkdown(rows);

      expect(result).toContain(
        '| 25   |             62.5 |           12.8 |        625 |             262.5 |',
      );
    });

    it('should handle integer decimal values by removing .0', () => {
      const rows: TableRow[] = [
        {
          zoom: 10,
          maxDistance: 25.0,
          tiltAngle: 20.0,
          lineCount: 250,
          focalLength: 105.0,
        },
      ];

      const result = formatter.formatMarkdown(rows);

      expect(result).toContain(
        '| 10   |               25 |             20 |        250 |               105 |',
      );
    });
  });

  describe('formatCSV', () => {
    it('should format a simple CSV with headers', () => {
      const rows: TableRow[] = [
        {
          zoom: 1,
          maxDistance: 2.5,
          tiltAngle: 45.5,
          lineCount: 25,
          focalLength: 10.5,
        },
        {
          zoom: 2,
          maxDistance: 5.0,
          tiltAngle: 35.2,
          lineCount: 50,
          focalLength: 21.0,
        },
      ];

      const result = formatter.formatCSV(rows);

      expect(result).toContain('Zoom,Max Distance (m),Tilt Angle (°),Line Count,Focal Length (mm)');
      expect(result).toContain('1,2.5,45.5,25,10.5');
      expect(result).toContain('2,5,35.2,50,21');
    });

    it('should handle decimal values in CSV', () => {
      const rows: TableRow[] = [
        {
          zoom: 1.5,
          maxDistance: 3.75,
          tiltAngle: 40.333,
          lineCount: 38,
          focalLength: 15.75,
        },
      ];

      const result = formatter.formatCSV(rows);

      expect(result).toContain('1.5,3.75,40.333,38,15.75');
    });

    it('should handle empty data in CSV', () => {
      const rows: TableRow[] = [];
      const result = formatter.formatCSV(rows);

      expect(result).toBe('Zoom,Max Distance (m),Tilt Angle (°),Line Count,Focal Length (mm)');
    });

    it('should handle large values in CSV', () => {
      const rows: TableRow[] = [
        {
          zoom: 25,
          maxDistance: 62.5,
          tiltAngle: 12.8,
          lineCount: 625,
          focalLength: 262.5,
        },
      ];

      const result = formatter.formatCSV(rows);

      expect(result).toContain('25,62.5,12.8,625,262.5');
    });

    it('should use CRLF line endings for RFC 4180 compliance', () => {
      const rows: TableRow[] = [
        {
          zoom: 1,
          maxDistance: 2.5,
          tiltAngle: 45.5,
          lineCount: 25,
          focalLength: 10.5,
        },
      ];

      const result = formatter.formatCSV(rows);

      expect(result).toMatch(/\r\n/);
      expect(result).toBe(
        'Zoom,Max Distance (m),Tilt Angle (°),Line Count,Focal Length (mm)\r\n1,2.5,45.5,25,10.5',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle zero values correctly', () => {
      const rows: TableRow[] = [
        {
          zoom: 0,
          maxDistance: 0,
          tiltAngle: 0,
          lineCount: 0,
          focalLength: 0,
        },
      ];

      const markdown = formatter.formatMarkdown(rows);
      const csv = formatter.formatCSV(rows);

      expect(markdown).toContain(
        '| 0    |                0 |              0 |          0 |                 0 |',
      );
      expect(csv).toContain('0,0,0,0,0');
    });

    it('should handle very small decimal values', () => {
      const rows: TableRow[] = [
        {
          zoom: 1,
          maxDistance: 0.0001,
          tiltAngle: 0.0001,
          lineCount: 1,
          focalLength: 0.0001,
        },
      ];

      const markdown = formatter.formatMarkdown(rows);
      const csv = formatter.formatCSV(rows);

      expect(markdown).toContain(
        '| 1    |           0.0001 |         0.0001 |          1 |            0.0001 |',
      );
      expect(csv).toContain('1,0.0001,0.0001,1,0.0001');
    });
  });
});
