export const CAMERA_HEIGHT = 20; // meters
export const SENSOR_RES_X = 2560; // pixels
export const SENSOR_RES_Y = 1440; // pixels
export const LINE_SPACING = 2; // meters
export const F_MIN = 4.8; // mm at zoomLevel=1
export const F_MAX = 120; // mm at zoomLevel=25

// FOV at minimum focal length
export const FOV_HORIZONTAL = 55; // degrees
export const FOV_VERTICAL = 33; // degrees

// Calculated sensor dimensions
export const SENSOR_WIDTH = 2 * F_MIN * Math.tan(((FOV_HORIZONTAL / 2) * Math.PI) / 180);
export const SENSOR_HEIGHT = 2 * F_MIN * Math.tan(((FOV_VERTICAL / 2) * Math.PI) / 180);

// Numerical tolerances
export const ANGLE_TOLERANCE = 1e-6;
export const PIXEL_TOLERANCE = 0.01;
export const DISTANCE_TOLERANCE = 0.001;
