export interface CameraConfig {
  height: number;
  sensorResolution: {
    x: number;
    y: number;
  };
  sensorDimensions: {
    width: number;
    height: number;
  };
}

export interface ProjectionParams {
  focalLength: number;
  tiltAngle: number; // radians
  cameraHeight: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}
