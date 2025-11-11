'use client'

import { useState, useEffect } from 'react'
import { ModuleType } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AVAILABLE_MODULES, MODULE_CATEGORIES, ModuleCategory } from '@/lib/modules'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Mapping des modules vers leurs routes
const MODULE_ROUTES: Record<ModuleType, string> = {
  TRANSPORT: '/transport',
  ACCOMMODATION: '/accommodation',
  PROGRAM: '/program',
  BUDGET: '/budget',
  REGISTRATION_PAYMENT: '/registration',
  MULTILANG: '/settings',
}

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
  const [isLoading, setIsLoading] = useState(true)

  // Charger les modules actifs depuis l'API au montage
  useEffect(() => {
    const fetchActiveModules = async () => {
      try {
        const response = await fetch(`/api/admin/events/${eventId}/modules`)
        if (response.ok) {
          const data = await response.json()
          const active = data.modules
            .filter((m: any) => m.isActive)
            .map((m: any) => m.type)
          setSelectedModules(new Set(active))
        }
      } catch (error) {
        console.error('Failed to fetch active modules:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveModules()
  }, [eventId])

  const toggleModule = async (moduleType: ModuleType) => {
    const newSelection = new Set(selectedModules)
    const isActivating = !newSelection.has(moduleType)

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

      // Afficher une notification de succès
      const moduleName = AVAILABLE_MODULES.find(m => m.type === moduleType)?.name || moduleType
      if (isActivating) {
        toast.success(`Module "${moduleName}" activé`, {
          description: 'Le module est maintenant accessible dans la navigation',
          duration: 3000
        })
      } else {
        toast.info(`Module "${moduleName}" désactivé`)
      }

      if (onChange) {
        onChange(Array.from(newSelection))
      }

      // Recharger la page pour mettre à jour la sidebar
      if (isActivating) {
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (error) {
      console.error('Failed to update module:', error)
      toast.error('Erreur lors de la mise à jour du module')
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
                {modules.map((module) => {
                  const isActive = selectedModules.has(module.type)
                  const moduleRoute = MODULE_ROUTES[module.type]

                  return (
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
                            {isActive && !module.comingSoon && (
                              <Badge variant="default" className="text-xs bg-green-500">
                                Actif
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive && !module.comingSoon && moduleRoute && (
                          <Link href={`/admin/events/${eventId}${moduleRoute}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              Configurer
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                        <Switch
                          id={`module-${module.type}`}
                          checked={isActive}
                          onCheckedChange={() => toggleModule(module.type)}
                          disabled={isUpdating || module.comingSoon}
                        />
                      </div>
                    </div>
                  )
                })}
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
