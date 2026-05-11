import './styles.css'

export {
  default as NepaliCalendar,
  StaticNepaliCalendar,
  NepaliCalendarView,
} from './shared/components/ui/nepali-calendar/nepali-calendar'
export { default } from './shared/components/ui/nepali-calendar/nepali-calendar'

export {
  NepaliCalendarProvider,
  useNepaliCalendarContext,
} from './shared/components/ui/nepali-calendar/nepali-calendar-context'
export type {
  CalendarData,
} from './shared/components/ui/nepali-calendar/nepali-calendar-context'

export { default as defaultCalendarData } from './shared/components/ui/nepali-calendar/nepali-calendar.data'

export type { NepaliDateValue } from './shared/components/ui/nepali-calendar/nepali-date-utils'
export {
  BS_MONTHS,
  WEEK_DAYS,
  adStringToBs,
  adToBs,
  bsStringToAd,
  bsToAd,
  compareBSDates,
  formatBSDate,
  getAvailableYears,
  getFirstValidDate,
  getMonthDays,
  getTodayBSFallback,
  getWeekdayOfBSDate,
  isValidBSDate,
  parseBSDate,
  toNepaliNumber,
} from './shared/components/ui/nepali-calendar/nepali-date-utils'

