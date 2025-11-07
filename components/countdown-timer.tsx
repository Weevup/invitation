"use client"

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: Date
  primaryColor: string
  secondaryColor: string
}

export function CountdownTimer({ targetDate, primaryColor, secondaryColor }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const distance = target - now

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      }
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  const isFinished = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (isFinished) {
    return (
      <div className="text-2xl font-bold" style={{ color: primaryColor }}>
        L&apos;événement a commencé!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
      <style jsx>{`
        .countdown-number {
          font-family: var(--font-abril);
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {[
        { value: timeLeft.days, label: 'Jours' },
        { value: timeLeft.hours, label: 'Heures' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Secondes' }
      ].map((item, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl md:text-5xl font-bold countdown-number">
            {item.value}
          </div>
          <div className="text-sm md:text-base mt-2 opacity-70" style={{ color: primaryColor }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
