"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3, Building2, Briefcase, TrendingUp, Users, PieChart
} from 'lucide-react'

interface Guest {
  company?: string
  companySize?: string
  industry?: string
  jobTitle?: string
  rsvp?: {
    attending?: boolean
  }
}

interface Event {
  id: string
  name: string
  guests: Guest[]
}

interface Stats {
  byCompanySize: Record<string, number>
  byIndustry: Record<string, number>
  byJobTitle: Record<string, number>
  byCompany: Record<string, number>
  total: number
  confirmed: number
}

const COMPANY_SIZE_COLORS: Record<string, string> = {
  'TPE': '#10b981',
  'PME': '#3b82f6',
  'ETI': '#8b5cf6',
  'GE': '#ef4444',
}

const COMPANY_SIZE_LABELS: Record<string, string> = {
  'TPE': 'TPE (1-10)',
  'PME': 'PME (11-250)',
  'ETI': 'ETI (251-5000)',
  'GE': 'Grande Ent. (5000+)',
}

export default function AnalyticsProPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [eventId])

  const fetchData = async () => {
    try {
      // Charger l'événement avec tous les invités (nécessaire pour les analytics)
      const response = await fetch(`/api/admin/events/${eventId}?includeGuests=true`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
        calculateStats(data.guests)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (guests: Guest[]) => {
    const confirmedGuests = guests.filter(g => g.rsvp?.attending === true)

    const byCompanySize: Record<string, number> = {}
    const byIndustry: Record<string, number> = {}
    const byJobTitle: Record<string, number> = {}
    const byCompany: Record<string, number> = {}

    confirmedGuests.forEach(guest => {
      if (guest.companySize) {
        byCompanySize[guest.companySize] = (byCompanySize[guest.companySize] || 0) + 1
      }
      if (guest.industry) {
        byIndustry[guest.industry] = (byIndustry[guest.industry] || 0) + 1
      }
      if (guest.jobTitle) {
        byJobTitle[guest.jobTitle] = (byJobTitle[guest.jobTitle] || 0) + 1
      }
      if (guest.company) {
        byCompany[guest.company] = (byCompany[guest.company] || 0) + 1
      }
    })

    setStats({
      byCompanySize,
      byIndustry,
      byJobTitle,
      byCompany,
      total: guests.length,
      confirmed: confirmedGuests.length,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-[#009197] mx-auto mb-4 animate-pulse" />
          <p className="text-[#004645]/70">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (!event || !stats) {
    return (
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardContent className="pt-6">
          <p className="text-center text-[#004645]/70">Données non disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const topIndustries = Object.entries(stats.byIndustry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const topJobTitles = Object.entries(stats.byJobTitle)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const topCompanies = Object.entries(stats.byCompany)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const maxIndustryCount = Math.max(...topIndustries.map(([, count]) => count), 1)
  const maxJobTitleCount = Math.max(...topJobTitles.map(([, count]) => count), 1)
  const maxCompanyCount = Math.max(...topCompanies.map(([, count]) => count), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#004645] mb-2" style={{ fontFamily: "var(--font-abril)" }}>
          Analytics Professionnelles
        </h2>
        <p className="text-[#004645]/70">
          Statistiques détaillées sur la composition de votre audience
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-[#9CD9F6]/30 bg-gradient-to-br from-[#004645]/5 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#004645]/70">Total Invités</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#004645]">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-[#009197]/30 bg-gradient-to-br from-[#009197]/5 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#004645]/70">Confirmés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#009197]">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card className="border-[#FF4713]/30 bg-gradient-to-br from-[#FF4713]/5 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#004645]/70">Secteurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#FF4713]">{Object.keys(stats.byIndustry).length}</div>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-gradient-to-br from-[#9CD9F6]/5 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#004645]/70">Entreprises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#9CD9F6]">{Object.keys(stats.byCompany).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Company Size Distribution */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#009197]" />
            <CardTitle className="text-[#004645]">Répartition par Taille d&apos;Entreprise</CardTitle>
          </div>
          <CardDescription>Distribution des invités confirmés par taille d&apos;entreprise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.byCompanySize)
              .sort(([, a], [, b]) => b - a)
              .map(([size, count]) => {
                const percentage = stats.confirmed > 0 ? (count / stats.confirmed) * 100 : 0
                return (
                  <div key={size} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COMPANY_SIZE_COLORS[size] || '#6b7280' }}
                        />
                        <span className="font-medium text-[#004645]">{COMPANY_SIZE_LABELS[size] || size}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#004645]/70">{percentage.toFixed(1)}%</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COMPANY_SIZE_COLORS[size] || '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Industries */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#009197]" />
              <CardTitle className="text-[#004645]">Top 10 Secteurs d&apos;Activité</CardTitle>
            </div>
            <CardDescription>Les secteurs les plus représentés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topIndustries.length === 0 ? (
                <p className="text-sm text-[#004645]/50 text-center py-4">Aucune donnée disponible</p>
              ) : (
                topIndustries.map(([industry, count]) => (
                  <div key={industry} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#004645]">{industry}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#009197] to-[#9CD9F6] transition-all duration-500"
                        style={{ width: `${(count / maxIndustryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Job Titles */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#FF4713]" />
              <CardTitle className="text-[#004645]">Top 10 Fonctions</CardTitle>
            </div>
            <CardDescription>Les fonctions les plus représentées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topJobTitles.length === 0 ? (
                <p className="text-sm text-[#004645]/50 text-center py-4">Aucune donnée disponible</p>
              ) : (
                topJobTitles.map(([title, count]) => (
                  <div key={title} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#004645]">{title}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF4713] to-[#FF8533] transition-all duration-500"
                        style={{ width: `${(count / maxJobTitleCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#004645]" />
            <CardTitle className="text-[#004645]">Top 10 Entreprises Représentées</CardTitle>
          </div>
          <CardDescription>Les entreprises avec le plus d&apos;invités confirmés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCompanies.length === 0 ? (
              <p className="text-sm text-[#004645]/50 text-center py-4">Aucune donnée disponible</p>
            ) : (
              topCompanies.map(([company, count]) => (
                <div key={company} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#004645]">{company}</span>
                    <Badge variant="outline">{count} invité{count > 1 ? 's' : ''}</Badge>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#004645] to-[#006C51] transition-all duration-500"
                      style={{ width: `${(count / maxCompanyCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
