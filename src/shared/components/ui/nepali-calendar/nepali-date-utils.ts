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

type CalendarData = {
  ref_ad: string
  ref_bs: string
  years: Record<number, number[]>
}

export type DetailedBSDate = {
  adDate: string
  bsYear: number
  bsMonth: number
  bsDay: number
  bsMonthName: string
  bsDate: string
}

type DetailedCalendarData = {
  adToBs: Record<string, DetailedBSDate>
  bsToAd: Record<string, string>
  bsOrdinal: Record<string, number>
}

type YearsData = Record<number, number[]>

const years = calendarData.years as YearsData

const availableYears = Object.keys(years)
  .map(Number)
  .sort((a, b) => a - b)

export function padNumber(value: number) {
  return String(value).padStart(2, '0')
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1)
  const day = padNumber(date.getDate())

  return `${year}-${month}-${day}`
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

export function formatBSDate(date: NepaliDateValue) {
  return `${date.year}-${padNumber(date.month)}-${padNumber(date.day)}`
}

export const generateDetailedData = (data: CalendarData): DetailedCalendarData => {
  const adToBs: Record<string, DetailedBSDate> = {}
  const bsToAd: Record<string, string> = {}
  const bsOrdinal: Record<string, number> = {}

  const refAd = toUTCDate(data.ref_ad)
  const [refBSYear, refBSMonth, refBSDay] = data.ref_bs.split('-').map(Number)

  const sortedYears = Object.keys(data.years)
    .map(Number)
    .sort((a, b) => a - b)

  let ordinal = 0
  let refOrdinal = 0

  // First pass: find ordinal for every BS date and locate ref_bs ordinal
  for (const bsYear of sortedYears) {
    const months = data.years[bsYear]

    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const bsMonth = monthIndex + 1
      const totalDaysInMonth = months[monthIndex]

      for (let bsDay = 1; bsDay <= totalDaysInMonth; bsDay++) {
        const bsDate = `${bsYear}-${padNumber(bsMonth)}-${padNumber(bsDay)}`

        bsOrdinal[bsDate] = ordinal

        if (bsYear === refBSYear && bsMonth === refBSMonth && bsDay === refBSDay) {
          refOrdinal = ordinal
        }

        ordinal++
      }
    }
  }

  // Second pass: generate AD <-> BS mapping for ALL dates, including before ref_bs
  for (const bsYear of sortedYears) {
    const months = data.years[bsYear]

    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const bsMonth = monthIndex + 1
      const totalDaysInMonth = months[monthIndex]

      for (let bsDay = 1; bsDay <= totalDaysInMonth; bsDay++) {
        const bsDate = `${bsYear}-${padNumber(bsMonth)}-${padNumber(bsDay)}`
        const currentOrdinal = bsOrdinal[bsDate]
        const diffFromRef = currentOrdinal - refOrdinal

        const ad = addDaysUTC(refAd, diffFromRef)
        const adDate = formatDateYMD(ad)

        adToBs[adDate] = {
          adDate,
          bsYear,
          bsMonth,
          bsDay,
          bsMonthName: BS_MONTHS[monthIndex],
          bsDate,
        }

        bsToAd[bsDate] = adDate
      }
    }
  }

  return {
    adToBs,
    bsToAd,
    bsOrdinal,
  }
}

const dataDetailed = generateDetailedData(calendarData)

export function toNepaliNumber(value: string | number) {
  return String(value)
    .split('')
    .map((char) => EN_TO_NP_NUMBER_MAP[char] ?? char)
    .join('')
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
  return availableYears
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

export function getBSOrdinal(date: NepaliDateValue) {
  const key = formatBSDate(date)
  const ordinal = dataDetailed.bsOrdinal[key]

  if (ordinal === undefined) {
    throw new Error(`Invalid BS date: ${formatBSDate(date)}`)
  }

  return ordinal
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

  const bsKey = formatBSDate(bsDate)
  const adDate = dataDetailed.bsToAd[bsKey]

  if (!adDate) {
    throw new Error(`Invalid BS date: ${formatBSDate(bsDate)}`)
  }

  return toUTCDate(adDate)
}

export function getWeekdayOfBSDate(bsDate: NepaliDateValue) {
  return bsToAd(bsDate).getUTCDay() // 0 = Sunday
}

export function getFirstValidDate() {
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
  return getFirstValidDate()
}

function formatTime12Hour(date: Date) {
  let hours = date.getHours()
  const minutes = padNumber(date.getMinutes())
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  hours = hours || 12

  return `${padNumber(hours)}:${minutes} ${ampm}`
}

export function adToBs(adDate: Date) {
  const adKey = formatDateKey(adDate)
  const bs = dataDetailed.adToBs[adKey]

  if (bs) {
    return {
      year: bs.bsYear,
      month: bs.bsMonth,
      day: bs.bsDay,
    }
  }

  // Fallback keeps old behavior for out-of-range dates.
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

  return formatDateYMD(ad)
}

export function adStringToBsWithTime(adString?: string | null) {
  if (!adString) return undefined

  const date = new Date(adString)
  const bs = adToBs(date)

  return `${formatBSDate(bs)} ${formatTime12Hour(date)}`
}
