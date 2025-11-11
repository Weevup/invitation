'use client'

import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Alert as AlertType } from '../../operations/helpers'

interface AlertsBannerProps {
  alerts: AlertType[]
}

export function AlertsBanner({ alerts }: AlertsBannerProps) {
  const [expanded, setExpanded] = useState(false)

  if (alerts.length === 0) {
    return null
  }

  // Trier par sévérité
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  const criticalAlerts = sortedAlerts.filter(a => a.severity === 'critical')
  const warningAlerts = sortedAlerts.filter(a => a.severity === 'warning')
  const infoAlerts = sortedAlerts.filter(a => a.severity === 'info')

  return (
    <div className="space-y-2">
      {/* Summary */}
      <Alert className={cn(
        "border-2",
        criticalAlerts.length > 0 ? "border-red-200 bg-red-50" :
        warningAlerts.length > 0 ? "border-orange-200 bg-orange-50" :
        "border-blue-200 bg-blue-50"
      )}>
        <AlertTriangle className={cn(
          "h-4 w-4",
          criticalAlerts.length > 0 ? "text-red-600" :
          warningAlerts.length > 0 ? "text-orange-600" :
          "text-blue-600"
        )} />
        <AlertTitle className="flex items-center justify-between">
          <span>
            🚨 Alertes actives ({alerts.length})
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-6 px-2"
          >
            {expanded ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Réduire
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Voir détails
              </>
            )}
          </Button>
        </AlertTitle>
        <AlertDescription className="space-y-1">
          <div className="flex flex-wrap gap-3 text-sm">
            {criticalAlerts.length > 0 && (
              <div className="flex items-center gap-1 text-red-700 font-medium">
                <AlertTriangle size={14} />
                {criticalAlerts.length} critique(s)
              </div>
            )}
            {warningAlerts.length > 0 && (
              <div className="flex items-center gap-1 text-orange-700">
                <AlertCircle size={14} />
                {warningAlerts.length} avertissement(s)
              </div>
            )}
            {infoAlerts.length > 0 && (
              <div className="flex items-center gap-1 text-blue-700">
                <Info size={14} />
                {infoAlerts.length} info(s)
              </div>
            )}
          </div>

          {!expanded && (
            <div className="text-sm space-y-1 mt-2">
              {sortedAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="flex items-start gap-2">
                  <span className={cn(
                    "font-medium",
                    alert.severity === 'critical' ? "text-red-700" :
                    alert.severity === 'warning' ? "text-orange-700" :
                    "text-blue-700"
                  )}>
                    •
                  </span>
                  <span>{alert.message}</span>
                </div>
              ))}
              {alerts.length > 3 && (
                <div className="text-xs text-muted-foreground ml-4">
                  ... et {alerts.length - 3} autre(s)
                </div>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Expanded details */}
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedAlerts.map(alert => (
            <Alert
              key={alert.id}
              className={cn(
                alert.severity === 'critical' ? "border-red-200 bg-red-50" :
                alert.severity === 'warning' ? "border-orange-200 bg-orange-50" :
                "border-blue-200 bg-blue-50"
              )}
            >
              {alert.severity === 'critical' ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : alert.severity === 'warning' ? (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              ) : (
                <Info className="h-4 w-4 text-blue-600" />
              )}
              <AlertTitle className={cn(
                "text-sm",
                alert.severity === 'critical' ? "text-red-900" :
                alert.severity === 'warning' ? "text-orange-900" :
                "text-blue-900"
              )}>
                {alert.message}
              </AlertTitle>
              {alert.details && alert.details.length > 0 && (
                <AlertDescription className={cn(
                  "text-xs space-y-1 mt-2",
                  alert.severity === 'critical' ? "text-red-700" :
                  alert.severity === 'warning' ? "text-orange-700" :
                  "text-blue-700"
                )}>
                  {alert.details.slice(0, 3).map((detail, i) => (
                    <div key={i}>• {detail}</div>
                  ))}
                  {alert.details.length > 3 && (
                    <div className="text-xs opacity-75">
                      ... et {alert.details.length - 3} autre(s)
                    </div>
                  )}
                </AlertDescription>
              )}
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}
