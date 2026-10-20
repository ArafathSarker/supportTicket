/**
 * Bootstrap defaults for the dynamic work-performed checklist.
 *
 * Production values come from /options/ (managed in the Django admin);
 * these are merged in until options load.
 */
export const DEFAULT_WORK_PERFORMED_ITEMS = [
  'Firmware upgrade',
  'Sensor replacement',
  'Network troubleshooting',
  'Calibration',
  'Preventive maintenance',
  'Wiring repair',
]

export function mergeWorkPerformed(fromApi: string[] | undefined): string[] {
  const set = new Set([...(fromApi ?? []), ...DEFAULT_WORK_PERFORMED_ITEMS])
  return [...set]
}
