"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightbulb, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface TextSuggestion {
  category: string
  suggestions: Array<{
    label: string
    text: string
  }>
}

export function RsvpSuggestions() {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    toast.success(`"${label}" copié dans le presse-papiers`)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const suggestions: TextSuggestion[] = [
    {
      category: "Question de participation",
      suggestions: [
        { label: "Standard", text: "Participez-vous à l'événement ?" },
        { label: "Informel", text: "Serez-vous des nôtres ?" },
        { label: "Enthousiaste", text: "Nous avons hâte de vous accueillir ! Serez-vous présent(e) ?" },
        { label: "Professionnel", text: "Merci de confirmer votre présence" },
        { label: "Convivial", text: "On compte sur vous, vous venez ?" }
      ]
    },
    {
      category: "Réponse Oui",
      suggestions: [
        { label: "Standard", text: "✓ J'accepte avec plaisir" },
        { label: "Enthousiaste", text: "Avec grand plaisir ! ✨" },
        { label: "Simple", text: "Oui, je serai là" },
        { label: "Enjoué", text: "J'y serai ! 🎉" },
        { label: "Professionnel", text: "Je confirme ma présence" }
      ]
    },
    {
      category: "Réponse Non",
      suggestions: [
        { label: "Standard", text: "✗ Je ne peux malheureusement pas venir" },
        { label: "Regret", text: "Je ne pourrai pas être présent(e), désolé(e)" },
        { label: "Simple", text: "Non, je ne peux pas" },
        { label: "Poli", text: "Je décline poliment l'invitation" },
        { label: "Amical", text: "Malheureusement, je ne peux pas me libérer" }
      ]
    },
    {
      category: "Accompagnants",
      suggestions: [
        { label: "Standard", text: "Nombre d'accompagnants" },
        { label: "Descriptif", text: "Combien de personnes vous accompagnent ?" },
        { label: "Informel", text: "Vous venez accompagné(e) ?" },
        { label: "Simple", text: "Accompagnants" },
        { label: "Détaillé", text: "Nombre de personnes supplémentaires (max X)" }
      ]
    },
    {
      category: "Choix de repas",
      suggestions: [
        { label: "Standard", text: "Choix de repas" },
        { label: "Descriptif", text: "Quel menu préférez-vous ?" },
        { label: "Informel", text: "Qu'aimeriez-vous manger ?" },
        { label: "Gastronomique", text: "Sélectionnez votre menu" },
        { label: "Simple", text: "Votre repas" }
      ]
    },
    {
      category: "Allergies",
      suggestions: [
        { label: "Standard", text: "Allergies ou régimes spécifiques" },
        { label: "Détaillé", text: "Allergies alimentaires, intolérances ou régimes particuliers" },
        { label: "Simple", text: "Allergies" },
        { label: "Santé", text: "Restrictions alimentaires" },
        { label: "Complet", text: "Allergies, intolérances, régimes (végétarien, végan, halal, kasher...)" }
      ]
    },
    {
      category: "Transport",
      suggestions: [
        { label: "Standard", text: "Besoins de transport" },
        { label: "Descriptif", text: "Avez-vous besoin d'un transport ?" },
        { label: "Détaillé", text: "Navette, parking, covoiturage" },
        { label: "Simple", text: "Transport" },
        { label: "Pratique", text: "Comment comptez-vous venir ?" }
      ]
    },
    {
      category: "Hébergement",
      suggestions: [
        { label: "Standard", text: "Besoins d'hébergement" },
        { label: "Descriptif", text: "Souhaitez-vous réserver un hébergement ?" },
        { label: "Détaillé", text: "Hôtel, chambre partagée, nuitée" },
        { label: "Simple", text: "Hébergement" },
        { label: "Pratique", text: "Avez-vous besoin d'une chambre d'hôtel ?" }
      ]
    },
    {
      category: "Récapitulatif",
      suggestions: [
        { label: "Standard", text: "Récapitulatif" },
        { label: "Simple", text: "Résumé" },
        { label: "Descriptif", text: "Vérifiez vos informations" },
        { label: "Formel", text: "Récapitulatif de votre réponse" },
        { label: "Action", text: "Dernière étape : validation" }
      ]
    },
    {
      category: "Bouton de validation",
      suggestions: [
        { label: "Standard", text: "Valider ma réponse" },
        { label: "Simple", text: "Valider" },
        { label: "Action", text: "Confirmer" },
        { label: "Enthousiaste", text: "C'est parti !" },
        { label: "Formel", text: "Envoyer ma réponse" }
      ]
    }
  ]

  return (
    <Card className="border-[#FF4713]/30 bg-gradient-to-br from-white to-[#FF4713]/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#FF4713]" />
          <CardTitle className="text-[#004645]">Suggestions de textes</CardTitle>
        </div>
        <CardDescription>
          Cliquez pour copier un texte suggéré et le coller dans votre formulaire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {suggestions.map((category, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-sm font-semibold text-[#004645] flex items-center gap-2">
                {category.category}
                <Badge variant="outline" className="text-xs">
                  {category.suggestions.length}
                </Badge>
              </h4>
              <div className="flex flex-wrap gap-2">
                {category.suggestions.map((suggestion, sIdx) => (
                  <Button
                    key={sIdx}
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(suggestion.text, suggestion.label)}
                    className={`text-xs ${
                      copiedText === suggestion.text
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-[#004645]/20 hover:border-[#FF4713] hover:bg-[#FF4713]/10'
                    }`}
                  >
                    {copiedText === suggestion.text ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {suggestion.label}: &quot;{suggestion.text}&quot;
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-[#004645]/5 rounded-lg">
          <p className="text-xs text-[#004645]/70">
            💡 <strong>Astuce</strong> : Personnalisez ces suggestions selon le ton de votre événement.
            Un mariage aura un ton plus chaleureux qu&apos;un événement corporate !
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
