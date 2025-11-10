'use client'

import { useState } from 'react'
import { ModuleType } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AVAILABLE_MODULES, MODULE_CATEGORIES, ModuleCategory } from '@/lib/modules'

interface ModuleSelectorProps {
  eventId: string
  activeModules?: ModuleType[]
  onChange?: (modules: ModuleType[]) => void
}

export function ModuleSelector({ eventId, activeModules = [], onChange }: ModuleSelectorProps) {
  const [selectedModules, setSelectedModules] = useState<Set<ModuleType>>(
    new Set(activeModules)
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleModule = async (moduleType: ModuleType) => {
    const newSelection = new Set(selectedModules)

    if (newSelection.has(moduleType)) {
      newSelection.delete(moduleType)
    } else {
      newSelection.add(moduleType)
    }

    setSelectedModules(newSelection)
    setIsUpdating(true)

    try {
      // Appel API pour activer/désactiver le module
      await fetch(`/api/admin/events/${eventId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleType,
          isActive: newSelection.has(moduleType)
        })
      })

      if (onChange) {
        onChange(Array.from(newSelection))
      }
    } catch (error) {
      console.error('Failed to update module:', error)
      // Revert on error
      setSelectedModules(new Set(selectedModules))
    } finally {
      setIsUpdating(false)
    }
  }

  // Group modules by category
  const modulesByCategory = AVAILABLE_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = []
    }
    acc[module.category].push(module)
    return acc
  }, {} as Record<ModuleCategory, typeof AVAILABLE_MODULES>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💡 Fonctionnalités avancées
        </CardTitle>
        <CardDescription>
          Activez des modules optionnels pour enrichir votre événement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(modulesByCategory).map(([category, modules]) => {
          const categoryInfo = MODULE_CATEGORIES[category as ModuleCategory]

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryInfo.icon}</span>
                <div>
                  <h4 className="font-semibold text-sm">{categoryInfo.label}</h4>
                  <p className="text-xs text-muted-foreground">{categoryInfo.description}</p>
                </div>
              </div>

              <div className="space-y-3 pl-7">
                {modules.map((module) => (
                  <div
                    key={module.type}
                    className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl mt-0.5">{module.icon}</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`module-${module.type}`}
                            className="font-medium cursor-pointer"
                          >
                            {module.name}
                          </Label>
                          {module.comingSoon && (
                            <Badge variant="secondary" className="text-xs">
                              Bientôt
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    <Switch
                      id={`module-${module.type}`}
                      checked={selectedModules.has(module.type)}
                      onCheckedChange={() => toggleModule(module.type)}
                      disabled={isUpdating || module.comingSoon}
                    />
                  </div>
                ))}
              </div>

              {category !== Object.keys(modulesByCategory)[Object.keys(modulesByCategory).length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          )
        })}

        {selectedModules.size > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedModules.size} module{selectedModules.size > 1 ? 's activés' : ' activé'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
