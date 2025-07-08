import { F_MIN } from './constants';

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function computeSensorDimensions() {
  const width = 2 * F_MIN * Math.tan(degToRad(55 / 2));
  const height = 2 * F_MIN * Math.tan(degToRad(33 / 2));
  return { width, height };
}
