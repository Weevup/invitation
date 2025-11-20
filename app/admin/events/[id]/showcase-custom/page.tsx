"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, Eye, Code, Palette, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomShowcasePage() {
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customHTML, setCustomHTML] = useState('')
  const [customCSS, setCustomCSS] = useState('')
  const [eventSlug, setEventSlug] = useState('')

  useEffect(() => {
    fetchShowcaseConfig()
  }, [eventId])

  const fetchShowcaseConfig = async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`)
      if (!response.ok) throw new Error('Failed to fetch event')

      const event = await response.json()
      setEventSlug(event.slug)
      setCustomHTML(event.showcaseCustomHTML || getDefaultHTML())
      setCustomCSS(event.showcaseCustomCSS || getDefaultCSS())
    } catch (error) {
      console.error('Error fetching showcase config:', error)
      toast.error('Erreur lors du chargement de la configuration')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultHTML = () => {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mon Événement</title>
</head>
<body>
  <div class="container">
    <header class="hero">
      <h1>Bienvenue à notre événement</h1>
      <p class="subtitle">Une expérience inoubliable vous attend</p>
      <a href="#register" class="cta-button">S'inscrire maintenant</a>
    </header>

    <section class="about">
      <h2>À propos de l'événement</h2>
      <p>Décrivez votre événement ici...</p>
    </section>

    <section class="details">
      <h2>Détails pratiques</h2>
      <div class="info-grid">
        <div class="info-card">
          <h3>📅 Date</h3>
          <p>15 Janvier 2025</p>
        </div>
        <div class="info-card">
          <h3>📍 Lieu</h3>
          <p>Paris, France</p>
        </div>
        <div class="info-card">
          <h3>⏰ Heure</h3>
          <p>18h00 - 22h00</p>
        </div>
      </div>
    </section>

    <section id="register" class="register">
      <h2>Rejoignez-nous</h2>
      <p>Réservez votre place dès maintenant</p>
      <a href="/guest/{{guestToken}}" class="cta-button">Confirmer ma présence</a>
    </section>

    <footer>
      <p>&copy; 2025 - Tous droits réservés</p>
    </footer>
  </div>
</body>
</html>`
  }

  const getDefaultCSS = () => {
    return `/* Variables de couleurs */
:root {
  --primary-color: #004645;
  --secondary-color: #FF4713;
  --accent-color: #9CD9F6;
  --text-color: #333;
  --bg-color: #ffffff;
}

/* Reset et base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background: linear-gradient(135deg, var(--accent-color) 0%, white 50%, var(--accent-color) 100%);
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 100px 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* Bouton CTA */
.cta-button {
  display: inline-block;
  padding: 15px 40px;
  background: white;
  color: var(--primary-color);
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* Sections */
section {
  padding: 80px 20px;
}

section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 3rem;
}

.info-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s;
}

.info-card:hover {
  transform: translateY(-5px);
}

.info-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--secondary-color);
}

/* Register Section */
.register {
  text-align: center;
  background: var(--primary-color);
  color: white;
  border-radius: 20px;
  margin: 0 20px;
}

/* Footer */
footer {
  text-align: center;
  padding: 40px 20px;
  background: var(--primary-color);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  section {
    padding: 50px 20px;
  }
}`
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showcaseCustomHTML: customHTML,
          showcaseCustomCSS: customCSS,
          showcaseTheme: 'custom', // Automatically switch to custom theme
        })
      })

      if (!response.ok) throw new Error('Failed to save showcase')

      toast.success('Page personnalisée sauvegardée avec succès')
    } catch (error) {
      console.error('Error saving showcase:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    window.open(`/event/${eventSlug}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#009197]" />
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
              Page Showcase Personnalisée
            </h1>
            <p className="text-[#004645]/70 mt-1">
              Créez une page 100% sur-mesure avec HTML et CSS
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Prévisualiser
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Card */}
      <Card className="mb-6 border-[#FF4713]/30 bg-[#FF4713]/5">
        <CardHeader>
          <CardTitle className="text-[#FF4713] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Mode Avancé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[#004645]/70">
          <p>• Ce mode vous donne un <strong>contrôle total</strong> sur le design de votre page</p>
          <p>• Vous pouvez utiliser <strong>n&apos;importe quel HTML/CSS</strong></p>
          <p>• Variable disponible : <code className="bg-gray-100 px-2 py-1 rounded">{'{{guestToken}}'}</code> sera remplacée par le token de l&apos;invité</p>
          <p>• La sauvegarde active automatiquement le thème &quot;custom&quot;</p>
        </CardContent>
      </Card>

      {/* Editor Tabs */}
      <Tabs defaultValue="html" className="space-y-6">
        <TabsList className="bg-white border border-[#9CD9F6]/30">
          <TabsTrigger value="html" className="data-[state=active]:bg-[#004645] data-[state=active]:text-white">
            <Code className="h-4 w-4 mr-2" />
            HTML
          </TabsTrigger>
          <TabsTrigger value="css" className="data-[state=active]:bg-[#004645] data-[state=active]:text-white">
            <Palette className="h-4 w-4 mr-2" />
            CSS
          </TabsTrigger>
        </TabsList>

        {/* HTML Editor */}
        <TabsContent value="html">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645]">Code HTML</CardTitle>
              <CardDescription>
                Structure complète de votre page showcase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customHTML}
                onChange={(e) => setCustomHTML(e.target.value)}
                rows={30}
                className="font-mono text-sm"
                placeholder="Entrez votre HTML ici..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSS Editor */}
        <TabsContent value="css">
          <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#004645]">Code CSS</CardTitle>
              <CardDescription>
                Styles personnalisés pour votre page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customCSS}
                onChange={(e) => setCustomCSS(e.target.value)}
                rows={30}
                className="font-mono text-sm"
                placeholder="Entrez votre CSS ici..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
