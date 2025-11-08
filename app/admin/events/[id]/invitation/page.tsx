"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Palette, Save, Eye, Image as ImageIcon, Type, Layout,
  MapPin, Calendar, Clock, Upload, Sparkles
} from 'lucide-react'
import { useParams } from 'next/navigation'

export default function InvitationDesignPage() {
  const params = useParams()
  const eventId = params.id as string

  const [previewMode, setPreviewMode] = useState(false)
  const [design, setDesign] = useState({
    // Contenu
    eventName: 'Votre événement',
    welcomeMessage: 'Vous êtes invité(e) à',
    description: 'Nous serions ravis de vous compter parmi nous pour célébrer ce moment spécial.',
    date: '',
    time: '',
    location: '',
    address: '',
    additionalInfo: '',

    // Design
    primaryColor: '#004645',
    secondaryColor: '#009197',
    accentColor: '#FF4713',
    backgroundColor: '#FFFFFF',
    textColor: '#004645',

    // Images
    headerImage: '',
    backgroundPattern: 'none',
    logoUrl: '',

    // Typographie
    fontFamily: 'Abril Fatface',
    fontSize: 'medium',

    // Layout
    layout: 'classic', // classic, modern, elegant, minimal
    showDate: true,
    showTime: true,
    showLocation: true,
    showMap: false,
    showDressCode: false,
    dressCode: '',

    // Sections supplémentaires
    showProgram: false,
    program: '',
    showAccommodation: false,
    accommodationInfo: '',
    showGifts: false,
    giftsInfo: ''
  })

  const handleSave = async () => {
    // TODO: Implémenter la sauvegarde vers l'API
    console.log('Saving invitation design:', design)
    alert('Design de l\'invitation sauvegardé avec succès !')
  }

  const updateDesign = (key: string, value: any) => {
    setDesign({ ...design, [key]: value })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Design de l&apos;invitation
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Personnalisez l&apos;apparence et le contenu de votre invitation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Mode édition' : 'Prévisualiser'}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <Card className="border-[#9CD9F6]/30 overflow-hidden">
          <div
            className="relative"
            style={{
              backgroundColor: design.backgroundColor,
              color: design.textColor
            }}
          >
            {/* Header Image */}
            {design.headerImage && (
              <div className="w-full h-64 bg-cover bg-center" style={{ backgroundImage: `url(${design.headerImage})` }} />
            )}

            <div className="p-8 md:p-12 space-y-8">
              {/* Logo */}
              {design.logoUrl && (
                <div className="flex justify-center">
                  <img src={design.logoUrl} alt="Logo" className="h-16" />
                </div>
              )}

              {/* Welcome Message */}
              <div className="text-center space-y-4">
                <p className="text-lg opacity-80">{design.welcomeMessage}</p>
                <h1
                  className="text-5xl font-bold"
                  style={{
                    fontFamily: design.fontFamily,
                    color: design.primaryColor
                  }}
                >
                  {design.eventName}
                </h1>
                <p className="text-lg max-w-2xl mx-auto opacity-90">{design.description}</p>
              </div>

              {/* Event Details */}
              <div className="max-w-2xl mx-auto space-y-4">
                {design.showDate && design.date && (
                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${design.primaryColor}10` }}>
                    <Calendar className="h-6 w-6" style={{ color: design.primaryColor }} />
                    <div>
                      <p className="font-semibold">Date</p>
                      <p>{new Date(design.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                )}

                {design.showTime && design.time && (
                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${design.primaryColor}10` }}>
                    <Clock className="h-6 w-6" style={{ color: design.primaryColor }} />
                    <div>
                      <p className="font-semibold">Heure</p>
                      <p>{design.time}</p>
                    </div>
                  </div>
                )}

                {design.showLocation && design.location && (
                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${design.primaryColor}10` }}>
                    <MapPin className="h-6 w-6" style={{ color: design.primaryColor }} />
                    <div>
                      <p className="font-semibold">Lieu</p>
                      <p>{design.location}</p>
                      {design.address && <p className="text-sm opacity-80">{design.address}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Sections */}
              {design.showDressCode && design.dressCode && (
                <div className="max-w-2xl mx-auto p-6 rounded-lg border" style={{ borderColor: design.primaryColor }}>
                  <h3 className="font-bold text-xl mb-2" style={{ color: design.primaryColor }}>Code vestimentaire</h3>
                  <p>{design.dressCode}</p>
                </div>
              )}

              {design.showProgram && design.program && (
                <div className="max-w-2xl mx-auto p-6 rounded-lg border" style={{ borderColor: design.primaryColor }}>
                  <h3 className="font-bold text-xl mb-2" style={{ color: design.primaryColor }}>Programme</h3>
                  <div className="whitespace-pre-line">{design.program}</div>
                </div>
              )}

              {design.showAccommodation && design.accommodationInfo && (
                <div className="max-w-2xl mx-auto p-6 rounded-lg border" style={{ borderColor: design.primaryColor }}>
                  <h3 className="font-bold text-xl mb-2" style={{ color: design.primaryColor }}>Hébergement</h3>
                  <div className="whitespace-pre-line">{design.accommodationInfo}</div>
                </div>
              )}

              {design.showGifts && design.giftsInfo && (
                <div className="max-w-2xl mx-auto p-6 rounded-lg border" style={{ borderColor: design.primaryColor }}>
                  <h3 className="font-bold text-xl mb-2" style={{ color: design.primaryColor }}>Cadeaux</h3>
                  <div className="whitespace-pre-line">{design.giftsInfo}</div>
                </div>
              )}

              {design.additionalInfo && (
                <div className="max-w-2xl mx-auto text-center">
                  <p className="opacity-80">{design.additionalInfo}</p>
                </div>
              )}

              {/* RSVP Button */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  className="text-white"
                  style={{
                    background: `linear-gradient(to right, ${design.primaryColor}, ${design.secondaryColor})`
                  }}
                >
                  Confirmer ma présence
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Edit Mode */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contenu */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645] flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Contenu de l&apos;invitation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Message d&apos;accueil</Label>
                  <Input
                    value={design.welcomeMessage}
                    onChange={(e) => updateDesign('welcomeMessage', e.target.value)}
                    className="border-[#9CD9F6]/30"
                  />
                </div>

                <div>
                  <Label>Nom de l&apos;événement</Label>
                  <Input
                    value={design.eventName}
                    onChange={(e) => updateDesign('eventName', e.target.value)}
                    className="border-[#9CD9F6]/30"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={design.description}
                    onChange={(e) => updateDesign('description', e.target.value)}
                    className="border-[#9CD9F6]/30"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={design.date}
                      onChange={(e) => updateDesign('date', e.target.value)}
                      className="border-[#9CD9F6]/30"
                    />
                  </div>
                  <div>
                    <Label>Heure</Label>
                    <Input
                      type="time"
                      value={design.time}
                      onChange={(e) => updateDesign('time', e.target.value)}
                      className="border-[#9CD9F6]/30"
                    />
                  </div>
                </div>

                <div>
                  <Label>Lieu</Label>
                  <Input
                    value={design.location}
                    onChange={(e) => updateDesign('location', e.target.value)}
                    className="border-[#9CD9F6]/30"
                    placeholder="Nom du lieu"
                  />
                </div>

                <div>
                  <Label>Adresse</Label>
                  <Input
                    value={design.address}
                    onChange={(e) => updateDesign('address', e.target.value)}
                    className="border-[#9CD9F6]/30"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <Label>Informations complémentaires</Label>
                  <Textarea
                    value={design.additionalInfo}
                    onChange={(e) => updateDesign('additionalInfo', e.target.value)}
                    className="border-[#9CD9F6]/30"
                    rows={2}
                    placeholder="Parking, accès, etc."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645] flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Sections additionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Code vestimentaire</Label>
                    <Switch
                      checked={design.showDressCode}
                      onCheckedChange={(checked) => updateDesign('showDressCode', checked)}
                    />
                  </div>
                  {design.showDressCode && (
                    <Input
                      value={design.dressCode}
                      onChange={(e) => updateDesign('dressCode', e.target.value)}
                      className="border-[#9CD9F6]/30"
                      placeholder="Ex: Tenue de soirée"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Programme</Label>
                    <Switch
                      checked={design.showProgram}
                      onCheckedChange={(checked) => updateDesign('showProgram', checked)}
                    />
                  </div>
                  {design.showProgram && (
                    <Textarea
                      value={design.program}
                      onChange={(e) => updateDesign('program', e.target.value)}
                      className="border-[#9CD9F6]/30"
                      rows={4}
                      placeholder="18h00 : Cocktail&#10;19h00 : Dîner&#10;21h00 : Soirée dansante"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Hébergement</Label>
                    <Switch
                      checked={design.showAccommodation}
                      onCheckedChange={(checked) => updateDesign('showAccommodation', checked)}
                    />
                  </div>
                  {design.showAccommodation && (
                    <Textarea
                      value={design.accommodationInfo}
                      onChange={(e) => updateDesign('accommodationInfo', e.target.value)}
                      className="border-[#9CD9F6]/30"
                      rows={3}
                      placeholder="Liste d'hôtels recommandés..."
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Informations cadeaux</Label>
                    <Switch
                      checked={design.showGifts}
                      onCheckedChange={(checked) => updateDesign('showGifts', checked)}
                    />
                  </div>
                  {design.showGifts && (
                    <Textarea
                      value={design.giftsInfo}
                      onChange={(e) => updateDesign('giftsInfo', e.target.value)}
                      className="border-[#9CD9F6]/30"
                      rows={3}
                      placeholder="Liste de mariage, cagnotte en ligne..."
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Design & Apparence */}
          <div className="space-y-4">
            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645] flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Couleurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Couleur principale</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={design.primaryColor}
                      onChange={(e) => updateDesign('primaryColor', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={design.primaryColor}
                      onChange={(e) => updateDesign('primaryColor', e.target.value)}
                      className="flex-1 border-[#9CD9F6]/30"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Couleur secondaire</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={design.secondaryColor}
                      onChange={(e) => updateDesign('secondaryColor', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={design.secondaryColor}
                      onChange={(e) => updateDesign('secondaryColor', e.target.value)}
                      className="flex-1 border-[#9CD9F6]/30"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Couleur d&apos;accent</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={design.accentColor}
                      onChange={(e) => updateDesign('accentColor', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={design.accentColor}
                      onChange={(e) => updateDesign('accentColor', e.target.value)}
                      className="flex-1 border-[#9CD9F6]/30"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Couleur de fond</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={design.backgroundColor}
                      onChange={(e) => updateDesign('backgroundColor', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={design.backgroundColor}
                      onChange={(e) => updateDesign('backgroundColor', e.target.value)}
                      className="flex-1 border-[#9CD9F6]/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645] flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Logo (URL)</Label>
                  <Input
                    value={design.logoUrl}
                    onChange={(e) => updateDesign('logoUrl', e.target.value)}
                    className="border-[#9CD9F6]/30"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label className="text-sm">Image d&apos;en-tête (URL)</Label>
                  <Input
                    value={design.headerImage}
                    onChange={(e) => updateDesign('headerImage', e.target.value)}
                    className="border-[#9CD9F6]/30"
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645] flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Affichage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Afficher la date</Label>
                  <Switch
                    checked={design.showDate}
                    onCheckedChange={(checked) => updateDesign('showDate', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Afficher l&apos;heure</Label>
                  <Switch
                    checked={design.showTime}
                    onCheckedChange={(checked) => updateDesign('showTime', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Afficher le lieu</Label>
                  <Switch
                    checked={design.showLocation}
                    onCheckedChange={(checked) => updateDesign('showLocation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Afficher la carte</Label>
                  <Switch
                    checked={design.showMap}
                    onCheckedChange={(checked) => updateDesign('showMap', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
