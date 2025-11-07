"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, Users, CheckCircle, XCircle, Clock, Download,
  Calendar, Building2
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalEvents: number
    totalGuests: number
    totalRsvps: number
    totalAttending: number
    totalDeclined: number
    responseRate: number
    attendanceRate: number
  }
  responseTimeline: Array<{ date: string; responses: number }>
  eventStats: Array<{
    name: string
    guests: number
    responses: number
    attending: number
    declined: number
    responseRate: number
  }>
  responseBreakdown: Array<{ name: string; value: number; fill: string }>
  topCompanies: Array<{ name: string; value: number }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!data) return

    // Create CSV content
    let csv = 'Statistiques Weevup Events\n\n'
    csv += 'Vue d\'ensemble\n'
    csv += `Événements totaux,${data.overview.totalEvents}\n`
    csv += `Invités totaux,${data.overview.totalGuests}\n`
    csv += `Réponses totales,${data.overview.totalRsvps}\n`
    csv += `Confirmations,${data.overview.totalAttending}\n`
    csv += `Refus,${data.overview.totalDeclined}\n`
    csv += `Taux de réponse,${data.overview.responseRate}%\n`
    csv += `Taux de participation,${data.overview.attendanceRate}%\n\n`

    csv += 'Statistiques par événement\n'
    csv += 'Nom,Invités,Réponses,Confirmés,Refus,Taux de réponse\n'
    data.eventStats.forEach(event => {
      csv += `${event.name},${event.guests},${event.responses},${event.attending},${event.declined},${event.responseRate}%\n`
    })

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="h-8 w-8 animate-spin text-[#009197]" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-[#004645]/70">Erreur lors du chargement des statistiques</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              Statistiques
            </h1>
            <p className="text-[#004645]/70 mt-1">
              Analyse détaillée de vos événements
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Événements</CardTitle>
            <Calendar className="h-4 w-4 text-[#009197]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              {data.overview.totalEvents}
            </div>
            <p className="text-xs text-[#004645]/70">Total</p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Invités</CardTitle>
            <Users className="h-4 w-4 text-[#009197]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
              {data.overview.totalGuests}
            </div>
            <p className="text-xs text-[#004645]/70">{data.overview.totalRsvps} réponses</p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Confirmations</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "var(--font-abril)" }}>
              {data.overview.totalAttending}
            </div>
            <p className="text-xs text-[#004645]/70">{data.overview.attendanceRate}% du total</p>
          </CardContent>
        </Card>

        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#004645]">Taux de réponse</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#FF4713]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF4713]" style={{ fontFamily: "var(--font-abril)" }}>
              {data.overview.responseRate}%
            </div>
            <p className="text-xs text-[#004645]/70">Moyenne globale</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Response Timeline */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645]">Évolution des réponses</CardTitle>
            <CardDescription>30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.responseTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#9CD9F6" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#004645', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis tick={{ fill: '#004645', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #9CD9F6' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                />
                <Line type="monotone" dataKey="responses" stroke="#009197" strokeWidth={2} dot={{ fill: '#009197' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Breakdown */}
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645]">Répartition des réponses</CardTitle>
            <CardDescription>État actuel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.responseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.responseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Event Stats */}
      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur mb-8">
        <CardHeader>
          <CardTitle className="text-[#004645]">Performance par événement</CardTitle>
          <CardDescription>Comparaison des événements</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.eventStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#9CD9F6" />
              <XAxis dataKey="name" tick={{ fill: '#004645', fontSize: 12 }} />
              <YAxis tick={{ fill: '#004645', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #9CD9F6' }} />
              <Legend />
              <Bar dataKey="guests" fill="#9CD9F6" name="Invités" />
              <Bar dataKey="attending" fill="#009197" name="Confirmés" />
              <Bar dataKey="declined" fill="#FF4713" name="Refus" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Companies */}
      {data.topCompanies.length > 0 && (
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-[#009197]" />
              <div>
                <CardTitle className="text-[#004645]">Top Entreprises</CardTitle>
                <CardDescription>Entreprises les plus représentées</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topCompanies} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#9CD9F6" />
                <XAxis type="number" tick={{ fill: '#004645', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#004645', fontSize: 12 }} width={150} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #9CD9F6' }} />
                <Bar dataKey="value" fill="#004645" name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
