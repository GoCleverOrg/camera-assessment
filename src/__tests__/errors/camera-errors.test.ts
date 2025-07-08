import {
  CameraAssessmentError,
  ImpossibleConstraintError,
  InvalidZoomLevelError,
} from '../../errors/camera-errors';

describe('CameraAssessmentError', () => {
  it('should create an error with correct message', () => {
    const error = new CameraAssessmentError('Test error message');
    expect(error.message).toBe('Test error message');
  });

  it('should have correct name', () => {
    const error = new CameraAssessmentError('Test error');
    expect(error.name).toBe('CameraAssessmentError');
  });

  it('should be an instance of Error', () => {
    const error = new CameraAssessmentError('Test error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should be an instance of CameraAssessmentError', () => {
    const error = new CameraAssessmentError('Test error');
    expect(error).toBeInstanceOf(CameraAssessmentError);
  });

  it('should maintain stack trace', () => {
    const error = new CameraAssessmentError('Test error');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('CameraAssessmentError');
  });
});

describe('ImpossibleConstraintError', () => {
  it('should create an error with correct message', () => {
    const error = new ImpossibleConstraintError('Cannot achieve requested parameters');
    expect(error.message).toBe('Cannot achieve requested parameters');
  });

  it('should have correct name', () => {
    const error = new ImpossibleConstraintError('Test constraint error');
    expect(error.name).toBe('ImpossibleConstraintError');
  });

  it('should be an instance of Error', () => {
    const error = new ImpossibleConstraintError('Test error');
    expect(error).toBeInstanceOf(Error);
  });

  it('should be an instance of CameraAssessmentError', () => {
    const error = new ImpossibleConstraintError('Test error');
    expect(error).toBeInstanceOf(CameraAssessmentError);
  });

  it('should be an instance of ImpossibleConstraintError', () => {
    const error = new ImpossibleConstraintError('Test error');
    expect(error).toBeInstanceOf(ImpossibleConstraintError);
  });

  it('should be used for physical constraint violations', () => {
    // Example use case
    const error = new ImpossibleConstraintError(
      'Cannot achieve 100m view distance with 1mm focal length',
    );
    expect(error.message).toContain('100m');
    expect(error.message).toContain('1mm');
  });
});

describe('InvalidZoomLevelError', () => {
  it('should create an error with formatted message for zoom below range', () => {
    const error = new InvalidZoomLevelError(0);
    expect(error.message).toBe('Zoom level must be between 1 and 25, got: 0');
  });

  it('should create an error with formatted message for zoom above range', () => {
    const error = new InvalidZoomLevelError(30);
    expect(error.message).toBe('Zoom level must be between 1 and 25, got: 30');
  });

  it('should include decimal zoom levels in message', () => {
    const error = new InvalidZoomLevelError(25.5);
    expect(error.message).toBe('Zoom level must be between 1 and 25, got: 25.5');
  });

  it('should include negative zoom levels in message', () => {
    const error = new InvalidZoomLevelError(-5);
    expect(error.message).toBe('Zoom level must be between 1 and 25, got: -5');
  });

  it('should have correct name', () => {
    const error = new InvalidZoomLevelError(100);
    expect(error.name).toBe('InvalidZoomLevelError');
  });

  it('should be an instance of Error', () => {
    const error = new InvalidZoomLevelError(0);
    expect(error).toBeInstanceOf(Error);
  });

  it('should be an instance of CameraAssessmentError', () => {
    const error = new InvalidZoomLevelError(0);
    expect(error).toBeInstanceOf(CameraAssessmentError);
  });

  it('should be an instance of InvalidZoomLevelError', () => {
    const error = new InvalidZoomLevelError(0);
    expect(error).toBeInstanceOf(InvalidZoomLevelError);
  });
});
