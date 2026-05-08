import { formatDateYMD } from '../../../utils/date'
import calendarData from './nepali-calendar.data'

export type NepaliDateValue = {
  year: number
  month: number // 1-12
  day: number
}

const EN_TO_NP_NUMBER_MAP: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
}

export const BS_MONTHS = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
]

export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type YearsData = Record<number, number[]>

const years = calendarData.years as YearsData

export function toNepaliNumber(value: string | number) {
  return String(value)
    .split('')
    .map((char) => EN_TO_NP_NUMBER_MAP[char] ?? char)
    .join('')
}

export function padNumber(value: number) {
  return String(value).padStart(2, '0')
}

export function formatBSDate(date: NepaliDateValue) {
  return `${date.year}-${padNumber(date.month)}-${padNumber(date.day)}`
}

export function parseBSDate(value?: string | null): NepaliDateValue | null {
  if (!value) return null

  const parts = value.split('-').map(Number)

  if (parts.length !== 3) return null

  const [year, month, day] = parts

  if (!year || !month || !day) return null

  return { year, month, day }
}

export function getAvailableYears() {
  return Object.keys(years)
    .map(Number)
    .sort((a, b) => a - b)
}

export function getMonthDays(year: number, month: number) {
  return years[year]?.[month - 1] ?? 0
}

export function isValidBSDate(date: NepaliDateValue) {
  const daysInMonth = getMonthDays(date.year, date.month)

  return (
    Boolean(daysInMonth) &&
    date.month >= 1 &&
    date.month <= 12 &&
    date.day >= 1 &&
    date.day <= daysInMonth
  )
}

export function compareBSDates(a: NepaliDateValue, b: NepaliDateValue) {
  if (a.year !== b.year) return a.year - b.year
  if (a.month !== b.month) return a.month - b.month
  return a.day - b.day
}

function toUTCDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addDaysUTC(date: Date, days: number) {
  const copied = new Date(date.getTime())
  copied.setUTCDate(copied.getUTCDate() + days)
  return copied
}

export function getBSOrdinal(date: NepaliDateValue) {
  let totalDays = 0

  const availableYears = getAvailableYears()

  for (const year of availableYears) {
    if (year > date.year) break

    for (let month = 1; month <= 12; month++) {
      const daysInMonth = getMonthDays(year, month)

      if (!daysInMonth) continue

      if (year === date.year && month === date.month) {
        return totalDays + (date.day - 1)
      }

      totalDays += daysInMonth
    }
  }

  throw new Error(`Invalid BS date: ${formatBSDate(date)}`)
}

export function getDaysDifferenceFromRef(target: NepaliDateValue) {
  const refBs = parseBSDate(calendarData.ref_bs)

  if (!refBs) {
    throw new Error('Invalid reference BS date')
  }

  return getBSOrdinal(target) - getBSOrdinal(refBs)
}

export function bsToAd(bsDate: NepaliDateValue) {
  if (!isValidBSDate(bsDate)) {
    throw new Error(`Invalid BS date: ${formatBSDate(bsDate)}`)
  }

  const refAd = toUTCDate(calendarData.ref_ad)
  const diff = getDaysDifferenceFromRef(bsDate)

  return addDaysUTC(refAd, diff)
}

export function getWeekdayOfBSDate(bsDate: NepaliDateValue) {
  return bsToAd(bsDate).getUTCDay() // 0 = Sunday
}

export function getFirstValidDate() {
  const availableYears = getAvailableYears()

  for (const year of availableYears) {
    for (let month = 1; month <= 12; month++) {
      if (getMonthDays(year, month) > 0) {
        return { year, month, day: 1 }
      }
    }
  }

  throw new Error('No valid date found in calendar data')
}

export function getTodayBSFallback() {
  // Since your data range is limited, we use the first valid date as fallback.
  // Later, you can add AD-to-BS conversion if needed.
  return getFirstValidDate()
}

export function adToBs(adDate: Date) {
  const refAd = toUTCDate(calendarData.ref_ad)
  const refBs = parseBSDate(calendarData.ref_bs)!

  let daysDiff = Math.floor((adDate.getTime() - refAd.getTime()) / (1000 * 60 * 60 * 24))

  let year = refBs.year
  let month = refBs.month
  let day = refBs.day

  while (daysDiff > 0) {
    day++

    const daysInMonth = getMonthDays(year, month)

    if (day > daysInMonth) {
      day = 1
      month++

      if (month > 12) {
        month = 1
        year++
      }
    }

    daysDiff--
  }

  return { year, month, day }
}

export function adStringToBs(adString?: string | null) {
  if (!adString) return undefined

  const date = new Date(adString)
  const bs = adToBs(date)

  return formatBSDate(bs)
}

export function bsStringToAd(bsString?: string | null) {
  if (!bsString) return undefined

  const parsed = parseBSDate(bsString)
  if (!parsed) return null

  const ad = bsToAd(parsed)

  return formatDateYMD(ad) // already in your utils
}
