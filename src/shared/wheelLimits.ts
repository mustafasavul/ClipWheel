export const minWheelItems = 4;
export const defaultWheelItems = 8;
export const maxWheelItems = 12;
export const wheelItemCountOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type WheelItemCount = (typeof wheelItemCountOptions)[number];

export function clampWheelItemCount(value: number): WheelItemCount {
  if (!Number.isFinite(value)) return defaultWheelItems;
  return Math.min(maxWheelItems, Math.max(minWheelItems, Math.round(value))) as WheelItemCount;
}
