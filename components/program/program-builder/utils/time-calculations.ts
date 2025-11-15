/**
 * Time calculation utilities for the program builder timeline
 */

export interface TimelineConfig {
  hourHeight: number
  minSessionHeight: number
  timeStart: number
  timeEnd: number
  snapInterval: number
}

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  hourHeight: 80, // pixels per hour
  minSessionHeight: 40, // minimum height for readability
  timeStart: 6, // 6:00 AM
  timeEnd: 23, // 11:00 PM
  snapInterval: 15, // Snap to 15 minute intervals
}

/**
 * Snap a date to the nearest time interval
 */
export function snapToInterval(date: Date, interval: number): Date {
  const minutes = date.getMinutes()
  const snappedMinutes = Math.round(minutes / interval) * interval
  const newDate = new Date(date)
  newDate.setMinutes(snappedMinutes, 0, 0)
  return newDate
}

/**
 * Calculate the position and height of a session in the timeline
 */
export function getSessionPosition(
  session: { startTime: string; duration: number },
  config: TimelineConfig
) {
  const start = new Date(session.startTime)
  const hours = start.getHours() + start.getMinutes() / 60
  const offsetFromStart = hours - config.timeStart
  const top = Math.max(0, offsetFromStart * config.hourHeight)

  // Height based on duration
  const durationHours = session.duration / 60
  const height = Math.max(config.minSessionHeight, durationHours * config.hourHeight)

  return { top, height }
}

/**
 * Convert a pixel position to a time on a given day
 */
export function getTimeFromPosition(
  top: number,
  day: Date,
  config: TimelineConfig
): Date {
  const hours = config.timeStart + (top / config.hourHeight)
  const newTime = new Date(day)
  newTime.setHours(Math.floor(hours))
  newTime.setMinutes(Math.round((hours % 1) * 60))
  newTime.setSeconds(0)
  newTime.setMilliseconds(0)
  return snapToInterval(newTime, config.snapInterval)
}

/**
 * Calculate the end time given a start time and duration
 */
export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  return new Date(startTime.getTime() + durationMinutes * 60000)
}

/**
 * Generate an array of hour markers for the timeline
 */
export function generateTimeMarkers(config: TimelineConfig): number[] {
  return Array.from(
    { length: config.timeEnd - config.timeStart },
    (_, i) => config.timeStart + i
  )
}
