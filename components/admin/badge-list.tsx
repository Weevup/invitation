'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Check, X, Printer, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface BadgeListProps {
  eventId: string
  badges: any[]
  stats: {
    total: number
    ready: number
    issued: number
    printed: number
  }
  onRefresh?: () => void
}

export function BadgeList({ eventId, badges, stats, onRefresh }: BadgeListProps) {
  const [selectedBadges, setSelectedBadges] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const readyBadgeIds = badges
        .filter((b) => b.isReady)
        .map((b) => b.id)
      setSelectedBadges(new Set(readyBadgeIds))
    } else {
      setSelectedBadges(new Set())
    }
  }

  const handleSelectBadge = (badgeId: string, checked: boolean) => {
    const newSelected = new Set(selectedBadges)
    if (checked) {
      newSelected.add(badgeId)
    } else {
      newSelected.delete(badgeId)
    }
    setSelectedBadges(newSelected)
  }

  const handleExport = async () => {
    if (selectedBadges.size === 0) {
      toast.error('Veuillez sélectionner au moins un badge')
      return
    }

    setExporting(true)

    try {
      const guestIds = badges
        .filter((b) => selectedBadges.has(b.id))
        .map((b) => b.guest.id)

      const response = await fetch(
        `/api/admin/events/${eventId}/badges/export?guestIds=${guestIds.join(',')}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'export')
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `badges-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`${selectedBadges.size} badge(s) exporté(s)`)

      // Refresh list to show updated print counts
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  const handleExportAll = async () => {
    setExporting(true)

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}/badges/export`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'export')
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `badges-tous-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`Tous les badges exportés (${stats.ready})`)

      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export')
    } finally {
      setExporting(false)
    }
  }

  const readyBadges = badges.filter((b) => b.isReady)
  const allReadySelected =
    readyBadges.length > 0 && selectedBadges.size === readyBadges.length

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prêts</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.ready}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Imprimés</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.printed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Distribués</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.issued}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allReadySelected}
            onCheckedChange={handleSelectAll}
            disabled={readyBadges.length === 0}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            {selectedBadges.size > 0
              ? `${selectedBadges.size} sélectionné(s)`
              : 'Tout sélectionner'}
          </label>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            disabled={stats.ready === 0 || exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Tout exporter ({stats.ready})
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={selectedBadges.size === 0 || exporting}
          >
            {exporting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Exporter ({selectedBadges.size})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Badges Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Invité</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Fonction</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="text-center">Impressions</TableHead>
              <TableHead className="text-center">Dernière impression</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {badges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Aucun badge généré
                </TableCell>
              </TableRow>
            ) : (
              badges.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBadges.has(badge.id)}
                      onCheckedChange={(checked) =>
                        handleSelectBadge(badge.id, checked as boolean)
                      }
                      disabled={!badge.isReady}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {badge.guest.firstName} {badge.guest.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {badge.guest.email}
                  </TableCell>
                  <TableCell className="text-sm">
                    {badge.guest.company || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {badge.guest.jobTitle || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {badge.isReady ? (
                        <Badge variant="default" className="bg-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Prêt
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="h-3 w-3 mr-1" />
                          Brouillon
                        </Badge>
                      )}
                      {badge.isIssued && (
                        <Badge variant="outline">Distribué</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {badge.printedCount}x
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {badge.lastPrintedAt
                      ? new Date(badge.lastPrintedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
