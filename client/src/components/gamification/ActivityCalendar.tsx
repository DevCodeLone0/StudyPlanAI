import { useState } from 'react'
import { clsx } from 'clsx'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { getHeatmapColor } from '@/services/gamificationService'
import type { ActivityCalendarData } from '@/services/gamificationService'

interface ActivityCalendarProps {
  data?: ActivityCalendarData[]
  days?: number
  onDateClick?: (date: string) => void
  className?: string
}

const generateSampleData = (days: number): ActivityCalendarData[] => {
  const data: ActivityCalendarData[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const count = Math.random() > 0.3 ? Math.floor(Math.random() * 15) : 0

    data.push({
      date: dateStr,
      count,
      types: count > 0
        ? [
            { type: 'MILESTONE_COMPLETED', count: Math.floor(count * 0.4) },
            { type: 'PLAN_CREATED', count: Math.floor(count * 0.3) },
            { type: 'PLAN_COMPLETED', count: Math.floor(count * 0.2) },
            { type: 'STREAK_MAINTENED', count: Math.floor(count * 0.1) },
          ].filter((t) => t.count > 0)
        : [],
    })
  }

  return data
}

export function ActivityCalendar({
  data: propData,
  days = 30,
  onDateClick,
  className,
}: ActivityCalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<ActivityCalendarData | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const data = propData || generateSampleData(days)

  const startDate = data[0]?.date || ''
  const endDate = data[data.length - 1]?.date || ''

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleMouseEnter = (e: React.MouseEvent, dayData: ActivityCalendarData) => {
    setHoveredDate(dayData)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredDate(null)
  }

  const handleClick = (dayData: ActivityCalendarData) => {
    if (onDateClick && dayData.count > 0) {
      onDateClick(dayData.date)
    }
  }

  const cols = 7
  const rows = Math.ceil(data.length / cols)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Calendar</CardTitle>
          <span className="text-sm text-gray-500">Last {days} Days</span>
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(startDate)} - {formatDate(endDate)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: cols }).map((_, colIndex) => {
                const index = rowIndex * cols + colIndex
                const dayData = data[index]

                if (!dayData) {
                  return <div key={colIndex} className="w-8 h-8" />
                }

                const colorClass = getHeatmapColor(dayData.count)
                const hasActivity = dayData.count > 0

                return (
                  <div
                    key={dayData.date}
                    className={clsx(
                      'w-8 h-8 rounded cursor-pointer transition-all duration-200',
                      colorClass,
                      hasActivity && 'hover:scale-110 hover:shadow-md',
                      !hasActivity && 'cursor-default'
                    )}
                    onMouseEnter={(e) => handleMouseEnter(e, dayData)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(dayData)}
                    title={`${formatDate(dayData.date)}: ${dayData.count} activities`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">Less</span>
          <div className="flex gap-1">
            {['bg-gray-100', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800'].map(
              (color, index) => (
                <div
                  key={index}
                  className={clsx('w-4 h-4 rounded', color)}
                  title={`${index} activities`}
                />
              )
            )}
          </div>
          <span className="text-sm text-gray-500">More</span>
        </div>
      </CardContent>

      {hoveredDate && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
          }}
        >
          <div className="font-semibold mb-1">{formatDate(hoveredDate.date)}</div>
          <div className="text-gray-300">{hoveredDate.count} activities</div>
          {hoveredDate.types.length > 0 && (
            <div className="mt-2 space-y-1">
              {hoveredDate.types.map((type, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <span className="text-gray-400">{type.type}</span>
                  <span>{type.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
