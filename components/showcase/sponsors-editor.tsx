"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Plus, X, Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Sponsor {
  name: string
  logo: string
  website: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
}

interface SponsorsEditorProps {
  sponsors: Sponsor[]
  onChange: (sponsors: Sponsor[]) => void
}

const tierColors = {
  platinum: { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-700', label: 'Platine' },
  gold: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', label: 'Or' },
  silver: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700', label: 'Argent' },
  bronze: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', label: 'Bronze' },
}

export function SponsorsEditor({ sponsors, onChange }: SponsorsEditorProps) {
  const [newSponsor, setNewSponsor] = useState<Sponsor>({
    name: '',
    logo: '',
    website: '',
    tier: 'silver',
  })

  const handleAdd = () => {
    if (newSponsor.name && newSponsor.logo) {
      onChange([...sponsors, newSponsor])
      setNewSponsor({ name: '', logo: '', website: '', tier: 'silver' })
    }
  }

  const handleRemove = (index: number) => {
    onChange(sponsors.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Add New Sponsor Form */}
      <Card className="p-4 border-[#9CD9F6]/30 bg-[#9CD9F6]/5">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sponsor-name" className="text-[#004645] text-xs">
                Nom du sponsor
              </Label>
              <Input
                id="sponsor-name"
                value={newSponsor.name}
                onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                placeholder="Acme Corporation"
                className="border-[#9CD9F6]/30"
              />
            </div>
            <div>
              <Label htmlFor="sponsor-tier" className="text-[#004645] text-xs">
                Niveau
              </Label>
              <Select
                value={newSponsor.tier}
                onValueChange={(value: Sponsor['tier']) =>
                  setNewSponsor({ ...newSponsor, tier: value })
                }
              >
                <SelectTrigger className="border-[#9CD9F6]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platinum">🏆 Platine</SelectItem>
                  <SelectItem value="gold">🥇 Or</SelectItem>
                  <SelectItem value="silver">🥈 Argent</SelectItem>
                  <SelectItem value="bronze">🥉 Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="sponsor-logo" className="text-[#004645] text-xs">
              Logo (URL)
            </Label>
            <Input
              id="sponsor-logo"
              value={newSponsor.logo}
              onChange={(e) => setNewSponsor({ ...newSponsor, logo: e.target.value })}
              placeholder="https://exemple.com/logo.png"
              className="border-[#9CD9F6]/30"
            />
          </div>
          <div>
            <Label htmlFor="sponsor-website" className="text-[#004645] text-xs">
              Site web (optionnel)
            </Label>
            <Input
              id="sponsor-website"
              value={newSponsor.website}
              onChange={(e) => setNewSponsor({ ...newSponsor, website: e.target.value })}
              placeholder="https://www.acme.com"
              className="border-[#9CD9F6]/30"
            />
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            className="w-full bg-[#009197] hover:bg-[#007b85] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter le sponsor
          </Button>
        </div>
      </Card>

      {/* Sponsors List */}
      {sponsors.length > 0 ? (
        <div className="space-y-3">
          <Label className="text-[#004645]">Sponsors ajoutés ({sponsors.length})</Label>
          {sponsors.map((sponsor, index) => {
            const tierStyle = tierColors[sponsor.tier]
            return (
              <Card
                key={index}
                className={`p-4 border-2 ${tierStyle.border} ${tierStyle.bg} hover:shadow-md transition-shadow`}
              >
                <div className="flex gap-4 items-center">
                  {sponsor.logo ? (
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="w-20 h-20 object-contain bg-white rounded p-2"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded bg-white flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-[#009197]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-[#004645]">{sponsor.name}</h4>
                        <p className={`text-xs ${tierStyle.text} font-medium`}>
                          {tierStyle.label}
                        </p>
                        {sponsor.website && (
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#009197] hover:underline"
                          >
                            {sponsor.website}
                          </a>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(index)}
                        className="text-[#FF4713] hover:text-red-700 hover:bg-[#FF4713]/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-[#9CD9F6]/30 rounded-lg">
          <Building2 className="h-12 w-12 text-[#9CD9F6] mx-auto mb-2" />
          <p className="text-sm text-[#004645]/70">Aucun sponsor ajouté</p>
        </div>
      )}
    </div>
  )
}
