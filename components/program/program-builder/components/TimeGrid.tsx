import { generateTimeMarkers, TimelineConfig } from '../utils/time-calculations'

interface TimeGridProps {
  config: TimelineConfig
}

export function TimeGrid({ config }: TimeGridProps) {
  const hours = generateTimeMarkers(config)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {hours.map((hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-t border-gray-200"
          style={{ top: `${(hour - config.timeStart) * config.hourHeight}px` }}
        >
          <span className="absolute -left-12 -top-2 text-xs text-gray-500 pointer-events-auto">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </div>
  )
}
