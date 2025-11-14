"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useEventModules } from '@/lib/modules/use-event-modules'
import { AVAILABLE_MODULES, MODULE_CATEGORIES, type ModuleType } from '@/lib/modules/types'

interface ModuleManagerProps {
  eventId: string
}

export function ModuleManager({ eventId }: ModuleManagerProps) {
  const { modules, hasModule, isLoading, error, refresh } = useEventModules(eventId)
  const [toggling, setToggling] = useState<string | null>(null)
  const [togglingSubFeature, setTogglingSubFeature] = useState<string | null>(null)

  const handleToggle = async (moduleType: ModuleType) => {
    setToggling(moduleType)

    try {
      const isCurrentlyActive = hasModule(moduleType)

      const response = await fetch(`/api/admin/events/${eventId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleType,
          isActive: !isCurrentlyActive,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle module')
      }

      await refresh()
    } catch (err) {
      console.error('Error toggling module:', err)
    } finally {
      setToggling(null)
    }
  }

  const handleSubFeatureToggle = async (moduleType: ModuleType, configKey: string, currentValue: boolean) => {
    setTogglingSubFeature(configKey)

    try {
      const currentModule = modules.find(m => m.type === moduleType)
      const currentConfig = currentModule?.config || {}

      const response = await fetch(`/api/admin/events/${eventId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleType,
          isActive: true, // Keep module active
          config: {
            ...currentConfig,
            [configKey]: !currentValue
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle sub-feature')
      }

      await refresh()
    } catch (err) {
      console.error('Error toggling sub-feature:', err)
    } finally {
      setTogglingSubFeature(null)
    }
  }

  const getSubFeatureStatus = (moduleType: ModuleType, configKey: string): boolean => {
    const eventModule = modules.find(m => m.type === moduleType)
    return eventModule?.config?.[configKey] ?? false
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-2 py-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>Erreur lors du chargement des modules</span>
        </CardContent>
      </Card>
    )
  }

  // Grouper les modules par catégorie
  const modulesByCategory = Object.entries(MODULE_CATEGORIES).map(([key, category]) => ({
    key,
    ...category,
    modules: AVAILABLE_MODULES.filter(m => m.category === key)
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
          Modules de l&apos;événement
        </h2>
        <p className="text-[#004645]/70">
          Activez les modules dont vous avez besoin pour votre événement
        </p>
      </div>

      {modulesByCategory.map(category => (
        <Card key={category.key} className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645] flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              {category.label}
            </CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {category.modules.map(module => {
                const isActive = hasModule(module.type)
                const isToggling = toggling === module.type

                return (
                  <div key={module.type} className="space-y-3">
                    {/* Module principal */}
                    <div
                      className={`
                        flex items-center justify-between p-4 rounded-lg border-2 transition-all
                        ${isActive
                          ? 'border-[#009197] bg-[#009197]/5'
                          : 'border-[#9CD9F6]/30 bg-white'
                        }
                        ${module.comingSoon ? 'opacity-60' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl mt-1">{module.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#004645]">{module.name}</h3>
                            {module.comingSoon && (
                              <Badge variant="outline" className="text-xs">
                                Bientôt disponible
                              </Badge>
                            )}
                            {isActive && !module.comingSoon && (
                              <Badge className="bg-[#009197] text-white text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Actif
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#004645]/70">{module.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {!module.comingSoon && (
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleToggle(module.type)}
                            disabled={isToggling}
                          />
                        )}
                        {isToggling && (
                          <Loader2 className="h-4 w-4 animate-spin text-[#009197]" />
                        )}
                      </div>
                    </div>

                    {/* Sous-fonctionnalités */}
                    {isActive && module.subFeatures && module.subFeatures.length > 0 && (
                      <div className="ml-12 space-y-2 pb-2">
                        <p className="text-xs font-semibold text-[#004645]/60 uppercase tracking-wider mb-2">
                          Fonctionnalités
                        </p>
                        {module.subFeatures.map(subFeature => {
                          const subIsActive = getSubFeatureStatus(module.type, subFeature.configKey)
                          const subIsToggling = togglingSubFeature === subFeature.configKey

                          return (
                            <div
                              key={subFeature.id}
                              className={`
                                flex items-center justify-between p-3 rounded-lg border transition-all
                                ${subIsActive
                                  ? 'border-[#009197]/50 bg-[#009197]/10'
                                  : 'border-[#9CD9F6]/20 bg-white/50'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">{subFeature.icon}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-medium text-[#004645]">
                                      {subFeature.name}
                                    </h4>
                                    {subIsActive && (
                                      <Badge variant="outline" className="text-xs bg-[#009197]/10 border-[#009197]/30">
                                        Activé
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#004645]/60 mt-0.5">
                                    {subFeature.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={subIsActive}
                                  onCheckedChange={() => handleSubFeatureToggle(module.type, subFeature.configKey, subIsActive)}
                                  disabled={subIsToggling}
                                />
                                {subIsToggling && (
                                  <Loader2 className="h-3 w-3 animate-spin text-[#009197]" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Statistiques */}
      <Card className="border-[#FF4713]/30 bg-gradient-to-br from-[#FF4713]/5 to-white/80">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#004645]/70">Modules actifs</p>
              <p className="text-3xl font-bold text-[#004645]">
                {modules.filter(m => m.isActive).length} / {AVAILABLE_MODULES.filter(m => !m.comingSoon).length}
              </p>
            </div>
            <div className="h-20 w-20 rounded-full bg-[#009197]/10 flex items-center justify-center">
              <span className="text-3xl">{MODULE_CATEGORIES.logistics.icon}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
