export interface Point {
  x: number;
  y: number;
}

export function getAngleFromCenter(center: Point, point: Point): number {
  const radians = Math.atan2(point.y - center.y, point.x - center.x);
  return (radians * 180) / Math.PI;
}

export function getSegmentIndex(center: Point, point: Point, segmentCount: number): number {
  const angle = (getAngleFromCenter(center, point) + 450) % 360;
  const segmentSize = 360 / segmentCount;
  return Math.floor((angle + segmentSize / 2) / segmentSize) % segmentCount;
}

export function getSegmentRotation(index: number, segmentCount: number): number {
  if (!Number.isFinite(index) || !Number.isFinite(segmentCount) || segmentCount <= 0) return 0;
  return (index * 360) / segmentCount;
}

export function getSegmentTransform(index: number, segmentCount: number, radius: number): string {
  const angle = (index / segmentCount) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
}
