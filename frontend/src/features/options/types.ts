/** Shape of GET /api/options/ — dynamic dropdown labels grouped by key. */
export interface OptionsMap {
  system: string[]
  category: string[]
  work_performed: string[]
  [key: string]: string[] | undefined
}
