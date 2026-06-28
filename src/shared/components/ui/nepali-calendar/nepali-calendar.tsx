import { createPortal } from 'react-dom'
import {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  BS_MONTHS,
  WEEK_DAYS,
  NepaliDateValue,
  compareBSDates,
  formatBSDate,
  getAvailableYears,
  getFirstValidDate,
  getMonthDays,
  getWeekdayOfBSDate,
  isValidBSDate,
  parseBSDate,
  toNepaliNumber,
} from './nepali-date-utils'
import { useNepaliCalendarContext, CalendarData } from './nepali-calendar-context'

export type NepaliCalendarViewRenderProps = {
  value?: string | null
  selectedValue: string
  parsedValue: NepaliDateValue | null
  viewYear: number
  viewMonth: number
  selectedDay: number
  availableYears: number[]
  validMonthsForYear: Array<{ month: number; label: string; disabled: boolean }>
  daysInMonth: number
  calendarCells: Array<NepaliDateValue | null>
  disabledDates: string[]
  minDate?: string
  maxDate?: string
  isDateDisabled?: (date: NepaliDateValue) => boolean
  disabledDateSet: Set<string>
  calendarData: CalendarData
  isDisabled: (date: NepaliDateValue) => boolean
  selectDate: (date: NepaliDateValue) => void
  handleYearChange: (year: number) => void
  handleMonthChange: (month: number) => void
  handleDayChange: (day: number) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  onViewChange?: () => void
  formatBSDate: (date: NepaliDateValue) => string
  toNepaliNumber: (value: string | number) => string
  BS_MONTHS: string[]
  WEEK_DAYS: string[]
  className?: string
  placeholder?: string
}

export type NepaliCalendarViewProps = {
  value?: string | null
  onChange?: (value: string, date: NepaliDateValue) => void

  disabledDates?: string[]
  minDate?: string
  maxDate?: string

  isDateDisabled?: (date: NepaliDateValue) => boolean

  className?: string
  placeholder?: string
  onViewChange?: () => void
  calendarComponent?: ComponentType<NepaliCalendarViewRenderProps>
  renderCalendar?: (props: NepaliCalendarViewRenderProps) => ReactNode
}

export function NepaliCalendarView({
  value,
  onChange,
  disabledDates = [],
  minDate,
  maxDate,
  isDateDisabled,
  className = '',
  placeholder,
  onViewChange,
  calendarComponent: CalendarComponent,
  renderCalendar,
}: NepaliCalendarViewProps) {
  const { data } = useNepaliCalendarContext()

  const availableYears = useMemo(() => getAvailableYears(), [data])

  const parsedValue = useMemo(() => parseBSDate(value), [value])

  const initialDate = useMemo(() => {
    if (parsedValue && isValidBSDate( parsedValue)) {
      return parsedValue
    }

    return getFirstValidDate()
  }, [data, parsedValue])

  const [viewYear, setViewYear] = useState(initialDate.year)
  const [viewMonth, setViewMonth] = useState(initialDate.month)
  const [selectedDay, setSelectedDay] = useState(initialDate.day)

  useEffect(() => {
    if (parsedValue && isValidBSDate(parsedValue)) {
      setViewYear(parsedValue.year)
      setViewMonth(parsedValue.month)
      setSelectedDay(parsedValue.day)
    }
  }, [data, parsedValue])

  const disabledDateSet = useMemo(() => {
    return new Set(disabledDates)
  }, [disabledDates])

  const parsedMinDate = useMemo(() => parseBSDate(minDate), [minDate])
  const parsedMaxDate = useMemo(() => parseBSDate(maxDate), [maxDate])

  const daysInMonth = getMonthDays( viewYear, viewMonth)

  const validMonthsForYear = useMemo(() => {
    return BS_MONTHS.map((monthName, index) => {
      const month = index + 1
      const days = getMonthDays( viewYear, month)

      return {
        month,
        label: monthName,
        disabled: days <= 0,
      }
    })
  }, [data, viewYear])

  const isDisabled = (date: NepaliDateValue) => {
    if (!isValidBSDate( date)) return true

    const formattedDate = formatBSDate(date)

    if (disabledDateSet.has(formattedDate)) return true

    if (parsedMinDate && compareBSDates(date, parsedMinDate) < 0) {
      return true
    }

    if (parsedMaxDate && compareBSDates(date, parsedMaxDate) > 0) {
      return true
    }

    if (isDateDisabled?.(date)) {
      return true
    }

    return false
  }

  const selectDate = (date: NepaliDateValue) => {
    if (isDisabled(date)) return

    setViewYear(date.year)
    setViewMonth(date.month)
    setSelectedDay(date.day)

    onChange?.(formatBSDate(date), date)
  }

  const handleYearChange = (year: number) => {
    let nextMonth = viewMonth
    let nextDay = selectedDay

    if (getMonthDays( year, nextMonth) <= 0) {
      nextMonth = 1
    }

    const nextDaysInMonth = getMonthDays( year, nextMonth)

    nextDay = Math.min(nextDay, nextDaysInMonth || 1)

    setViewYear(year)
    setViewMonth(nextMonth)
    setSelectedDay(nextDay)

    onViewChange?.()
  }

  const handleMonthChange = (month: number) => {
    const nextDaysInMonth = getMonthDays( viewYear, month)
    const nextDay = Math.min(selectedDay, nextDaysInMonth || 1)

    setViewMonth(month)
    setSelectedDay(nextDay)

    onViewChange?.()
  }

  const handleDayChange = (day: number) => {
    const date = {
      year: viewYear,
      month: viewMonth,
      day,
    }

    selectDate(date)
  }

  const goToPreviousMonth = () => {
    let nextYear = viewYear
    let nextMonth = viewMonth - 1

    if (nextMonth < 1) {
      nextYear -= 1
      nextMonth = 12
    }

    if (!availableYears.includes(nextYear)) return
    if (getMonthDays( nextYear, nextMonth) <= 0) return

    setViewYear(nextYear)
    setViewMonth(nextMonth)

    onViewChange?.()
  }

  const goToNextMonth = () => {
    let nextYear = viewYear
    let nextMonth = viewMonth + 1

    if (nextMonth > 12) {
      nextYear += 1
      nextMonth = 1
    }

    if (!availableYears.includes(nextYear)) return
    if (getMonthDays( nextYear, nextMonth) <= 0) return

    setViewYear(nextYear)
    setViewMonth(nextMonth)

    onViewChange?.()
  }

  const calendarCells = useMemo(() => {
    if (daysInMonth <= 0) return []

    const firstWeekday = getWeekdayOfBSDate( {
      year: viewYear,
      month: viewMonth,
      day: 1,
    })

    const cells: Array<NepaliDateValue | null> = []

    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        year: viewYear,
        month: viewMonth,
        day,
      })
    }

    return cells
  }, [data, viewYear, viewMonth, daysInMonth])

  const selectedValue = parsedValue ? formatBSDate(parsedValue) : ''

  const renderProps: NepaliCalendarViewRenderProps = {
    value,
    selectedValue,
    parsedValue,
    viewYear,
    viewMonth,
    selectedDay,
    availableYears,
    validMonthsForYear,
    daysInMonth,
    calendarCells,
    disabledDates,
    minDate,
    maxDate,
    isDateDisabled,
    disabledDateSet,
    calendarData: data,
    isDisabled,
    selectDate,
    handleYearChange,
    handleMonthChange,
    handleDayChange,
    goToPreviousMonth,
    goToNextMonth,
    onViewChange,
    formatBSDate,
    toNepaliNumber,
    BS_MONTHS,
    WEEK_DAYS,
    className,
    placeholder,
  }

  if (CalendarComponent) {
    return <CalendarComponent {...renderProps} />
  }

  if (renderCalendar) {
    return <>{renderCalendar(renderProps)}</>
  }

  return (
    <div className={`nepali-calendar ${className}`}>
      <div className="nepali-calendar__header">
        <button
          type="button"
          className="nepali-calendar__nav-btn"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="nepali-calendar__title">
          {BS_MONTHS[viewMonth - 1]} {viewYear}
        </div>

        <button
          type="button"
          className="nepali-calendar__nav-btn"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="nepali-calendar__controls">
        <select
          value={viewYear}
          onChange={(event) => handleYearChange(Number(event.target.value))}
          aria-label="Select year"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={viewMonth}
          onChange={(event) => handleMonthChange(Number(event.target.value))}
          aria-label="Select month"
        >
          {validMonthsForYear.map((item) => (
            <option key={item.month} value={item.month} disabled={item.disabled}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={selectedDay}
          onChange={(event) => handleDayChange(Number(event.target.value))}
          disabled={daysInMonth <= 0}
          aria-label="Select day"
        >
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1

            const date = {
              year: viewYear,
              month: viewMonth,
              day,
            }

            return (
              <option key={day} value={day} disabled={isDisabled(date)}>
                {toNepaliNumber(day)}
              </option>
            )
          })}
        </select>
      </div>

      <div className="nepali-calendar__weekdays">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="nepali-calendar__weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="nepali-calendar__grid">
        {calendarCells.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="nepali-calendar__cell nepali-calendar__cell--empty"
              />
            )
          }

          const formattedDate = formatBSDate(date)

          const dateDisabled = isDisabled(date)

          const selected = value === formattedDate

          return (
            <button
              type="button"
              key={formattedDate}
              className={[
                'nepali-calendar__cell',
                selected ? 'nepali-calendar__cell--selected' : '',
                dateDisabled ? 'nepali-calendar__cell--disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={dateDisabled}
              onClick={() => handleDayChange(date.day)}
              aria-pressed={selected}
            >
              {toNepaliNumber(date.day)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function StaticNepaliCalendar(props: NepaliCalendarViewProps) {
  return <NepaliCalendarView {...props} />
}

type NepaliCalendarProps = NepaliCalendarViewProps & {
  placeholder?: string

  label?: string
  error?: string
  touched?: boolean
  disabled?: boolean
}

type PopoverPlacement = 'top' | 'bottom'

type PopoverPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
  placement: PopoverPlacement
  ready: boolean
}

const POPOVER_GAP = 6
const VIEWPORT_PADDING = 8
const MOBILE_BREAKPOINT = 480
const MIN_POPOVER_WIDTH = 280
const DEFAULT_POPOVER_WIDTH = 320
const MIN_POPOVER_HEIGHT = 220

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

export default function NepaliCalendar({
  value,
  onChange,
  disabledDates = [],
  minDate,
  maxDate,
  isDateDisabled,
  className = '',
  placeholder = 'Select date',
  calendarComponent,
  renderCalendar,
  label,
  error,
  touched,
  disabled = false,
}: NepaliCalendarProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [open, setOpen] = useState(false)

  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({
    top: 0,
    left: 0,
    width: DEFAULT_POPOVER_WIDTH,
    maxHeight: 400,
    placement: 'bottom',
    ready: false,
  })

  const { data } = useNepaliCalendarContext()
  const parsedValue = useMemo(() => parseBSDate(value), [value])
  const hasError = Boolean(error && touched)

  const updatePopoverPosition = useCallback(() => {
    const triggerElement = triggerRef.current

    if (!triggerElement) return

    const triggerRect = triggerElement.getBoundingClientRect()
    const popoverElement = popoverRef.current

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const isMobile = viewportWidth <= MOBILE_BREAKPOINT

    const measuredPopoverWidth = popoverElement?.offsetWidth || DEFAULT_POPOVER_WIDTH
    const measuredPopoverHeight = popoverElement?.offsetHeight || MIN_POPOVER_HEIGHT

    const maxAvailableWidth = viewportWidth - VIEWPORT_PADDING * 2

    const desiredWidth = isMobile
      ? maxAvailableWidth
      : Math.max(triggerRect.width, measuredPopoverWidth, DEFAULT_POPOVER_WIDTH)

    const popoverWidth = clamp(desiredWidth, MIN_POPOVER_WIDTH, maxAvailableWidth)

    const availableSpaceBelow =
      viewportHeight - triggerRect.bottom - POPOVER_GAP - VIEWPORT_PADDING

    const availableSpaceAbove = triggerRect.top - POPOVER_GAP - VIEWPORT_PADDING

    const shouldOpenAbove =
      measuredPopoverHeight > availableSpaceBelow && availableSpaceAbove > availableSpaceBelow

    const placement: PopoverPlacement = shouldOpenAbove ? 'top' : 'bottom'

    const availableHeight = shouldOpenAbove ? availableSpaceAbove : availableSpaceBelow

    const maxHeight = Math.max(
      Math.min(availableHeight, viewportHeight - VIEWPORT_PADDING * 2),
      MIN_POPOVER_HEIGHT,
    )

    let left = isMobile ? VIEWPORT_PADDING : triggerRect.left

    if (!isMobile && left + popoverWidth > viewportWidth - VIEWPORT_PADDING) {
      left = viewportWidth - VIEWPORT_PADDING - popoverWidth
    }

    left = clamp(left, VIEWPORT_PADDING, viewportWidth - VIEWPORT_PADDING - popoverWidth)

    const visiblePopoverHeight = Math.min(measuredPopoverHeight, maxHeight)

    let top = shouldOpenAbove
      ? triggerRect.top - POPOVER_GAP - visiblePopoverHeight
      : triggerRect.bottom + POPOVER_GAP

    const maxAllowedTop = viewportHeight - VIEWPORT_PADDING - visiblePopoverHeight

    top = clamp(top, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, maxAllowedTop))

    setPopoverPosition({
      top,
      left,
      width: popoverWidth,
      maxHeight,
      placement,
      ready: true,
    })
  }, [])

  const throttledUpdatePopoverPosition = useCallback(() => {
    if (animationFrameRef.current !== null) return

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null
      updatePopoverPosition()
    })
  }, [updatePopoverPosition])

  useEffect(() => {
    if (!open) return

    setPopoverPosition((previous) => ({
      ...previous,
      ready: false,
    }))

    updatePopoverPosition()

    const firstFrame = window.requestAnimationFrame(updatePopoverPosition)
    const secondFrame = window.requestAnimationFrame(updatePopoverPosition)

    window.addEventListener('resize', throttledUpdatePopoverPosition)
    window.addEventListener('scroll', throttledUpdatePopoverPosition, true)

    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      window.removeEventListener('resize', throttledUpdatePopoverPosition)
      window.removeEventListener('scroll', throttledUpdatePopoverPosition, true)
    }
  }, [open, updatePopoverPosition, throttledUpdatePopoverPosition])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      const clickedInsideWrapper = wrapperRef.current?.contains(target) ?? false
      const clickedInsidePopover = popoverRef.current?.contains(target) ?? false

      if (!clickedInsideWrapper && !clickedInsidePopover) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleDateSelect = (formattedValue: string, dateValue: NepaliDateValue) => {
    onChange?.(formattedValue, dateValue)
    setOpen(false)
  }

  const selectedValue = parsedValue ? formatBSDate(parsedValue) : ''

  return (
    <>
      <div
        ref={wrapperRef}
        className={[
          'nepali-date-picker',
          open ? 'nepali-date-picker--open' : '',
          hasError ? 'nepali-date-picker--error' : '',
          disabled ? 'nepali-date-picker--disabled' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label ? <label className="input-label mb-4">{label}</label> : null}

        <button
          ref={triggerRef}
          type="button"
          className="nepali-date-picker__trigger"
          onClick={() => {
            if (disabled) return

            setOpen((prev) => !prev)
          }}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span
            className={[
              'nepali-date-picker__value',
              !selectedValue ? 'nepali-date-picker__value--placeholder' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {selectedValue || placeholder}
          </span>
        </button>

        {hasError ? <div className="nepali-date-picker__error">{error}</div> : null}
      </div>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className={[
              'nepali-date-picker__popover',
              `nepali-date-picker__popover--${popoverPosition.placement}`,
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              position: 'fixed',
              top: popoverPosition.top,
              left: popoverPosition.left,
              width: popoverPosition.width,
              maxHeight: popoverPosition.maxHeight,
              overflowY: 'auto',
              zIndex: 999999,
              visibility: popoverPosition.ready ? 'visible' : 'hidden',
            }}
            role="dialog"
            aria-label="Nepali calendar"
          >
            <NepaliCalendarView
              value={value}
              onChange={handleDateSelect}
              disabledDates={disabledDates}
              minDate={minDate}
              maxDate={maxDate}
              isDateDisabled={isDateDisabled}
              className={className}
              placeholder={placeholder}
              calendarComponent={calendarComponent}
              renderCalendar={renderCalendar}
              onViewChange={throttledUpdatePopoverPosition}
            />
          </div>,
          document.body,
        )}
    </>
  )
}