/**
 * Dynamic work-performed checklist defaults.
 *
 * The production values come from /api/options/ (managed in Django admin),
 * these are the bootstrap defaults used until options load.
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
