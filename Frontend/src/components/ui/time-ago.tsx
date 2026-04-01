import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface TimeAgoProps {
  date: string | Date
  className?: string
  addSuffix?: boolean
}

export function TimeAgo({ date, className, addSuffix = true }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    const updateTime = () => {
      try {
        const d = typeof date === "string" ? new Date(date) : date
        setTimeAgo(formatDistanceToNow(d, { addSuffix, locale: vi }))
      } catch (error) {
        setTimeAgo("Không xác định")
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) 

    return () => clearInterval(interval)
  }, [date, addSuffix])

  return <span className={className}>{timeAgo}</span>
}
