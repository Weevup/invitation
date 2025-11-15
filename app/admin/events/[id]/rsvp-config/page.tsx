"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings, Plus, Trash2, GripVertical, Eye, Save,
  MessageSquare, CheckSquare, List, Calendar,
  User, Mail, Phone, Building, Utensils, Users, PlayCircle
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { RSVPPreviewInteractive } from '@/components/admin/rsvp-preview-interactive'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger({ component: 'RsvpConfigPage' })


interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  description?: string
}

const defaultFields: FormField[] = [
  {
    id: 'attending',
    type: 'radio',
    label: 'Serez-vous présent(e) ?',
    required: true,
    options: ['Oui, je serai présent(e)', 'Non, je ne pourrai pas venir']
  }
]

const fieldTypeIcons = {
  text: User,
  email: Mail,
  phone: Phone,
  textarea: MessageSquare,
  select: List,
  radio: CheckSquare,
  checkbox: CheckSquare,
  number: Users
}

export default function RSVPConfigPage() {
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState<FormField[]>(defaultFields)
  const [previewMode, setPreviewMode] = useState<'edit' | 'static' | 'interactive'>('edit')
  const [eventName, setEventName] = useState('Votre événement')
  const [config, setConfig] = useState({
    allowPlusOne: false,
    maxPlusOnes: 1,
    collectDietaryRestrictions: false,
    collectMealChoice: false,
    mealOptions: ['Menu Classique', 'Menu Végétarien', 'Menu Vegan'],
    collectAccommodation: false,
    deadlineDate: '',
    confirmationMessage: 'Merci pour votre réponse ! Nous avons bien enregistré votre participation.',
    declineMessage: 'Nous sommes désolés que vous ne puissiez pas être des nôtres. Peut-être une prochaine fois !'
  })

  // Load existing RSVP configuration and event name
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Load RSVP config
        const rsvpResponse = await fetch(`/api/admin/events/${eventId}/rsvp-config`);
        if (rsvpResponse.ok) {
          const data = await rsvpResponse.json();
          if (data && Object.keys(data).length > 0) {
            if (data.fields) {
              setFields(data.fields);
            }
            if (data.config) {
              setConfig(prev => ({ ...prev, ...data.config }));
            }
          }
        }

        // Load event name
        const eventResponse = await fetch(`/api/admin/events/${eventId}`);
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          if (eventData.event?.name) {
            setEventName(eventData.event.name);
          }
        }
      } catch (error) {
        logger.error(error, { action: 'FailedToLoadRsvpConfiguration' });
      }
    };

    if (eventId) {
      loadConfig();
    }
  }, [eventId]);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: 'Nouveau champ',
      required: false,
      placeholder: type === 'select' || type === 'radio' || type === 'checkbox' ? undefined : 'Entrez votre réponse...',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : undefined
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeField = (id: string) => {
    if (id === 'attending') return // Ne pas supprimer le champ principal
    setFields(fields.filter(f => f.id !== id))
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= fields.length) return

    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
    setFields(newFields)
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${eventId}/rsvp-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, config }),
      });

      if (response.ok) {
        toast.success('Configuration RSVP sauvegardée avec succès !');
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      toast.error('Impossible d\'enregistrer la configuration RSVP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
            Configuration du formulaire RSVP
          </h1>
          <p className="text-[#004645]/70 mt-1">
            Personnalisez le formulaire de réponse pour vos invités
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode === 'static' ? 'default' : 'outline'}
            onClick={() => setPreviewMode(previewMode === 'static' ? 'edit' : 'static')}
            className={previewMode === 'static' ? 'bg-[#009197]' : 'border-[#009197] text-[#009197] hover:bg-[#009197] hover:text-white'}
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button
            variant={previewMode === 'interactive' ? 'default' : 'outline'}
            onClick={() => setPreviewMode(previewMode === 'interactive' ? 'edit' : 'interactive')}
            className={previewMode === 'interactive' ? 'bg-[#FF4713]' : 'border-[#FF4713] text-[#FF4713] hover:bg-[#FF4713] hover:text-white'}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Test interactif
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {previewMode === 'interactive' ? (
        /* Interactive Preview Mode */
        <RSVPPreviewInteractive fields={fields} config={config} eventName={eventName} />
      ) : previewMode === 'static' ? (
        /* Static Preview Mode */
        <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-[#004645]">Aperçu statique du formulaire</CardTitle>
            <CardDescription>Vue simplifiée de tous les champs du formulaire</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-[#004645]">
                  {field.label}
                  {field.required && <span className="text-[#FF4713] ml-1">*</span>}
                </Label>
                {field.description && (
                  <p className="text-sm text-[#004645]/70">{field.description}</p>
                )}

                {field.type === 'textarea' && (
                  <Textarea placeholder={field.placeholder} className="border-[#9CD9F6]/30" />
                )}

                {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number') && (
                  <Input type={field.type} placeholder={field.placeholder} className="border-[#9CD9F6]/30" />
                )}

                {field.type === 'select' && (
                  <Select>
                    <SelectTrigger className="border-[#9CD9F6]/30">
                      <SelectValue placeholder="Sélectionnez une option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option, idx) => (
                        <SelectItem key={idx} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {field.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="radio" name={field.id} id={`${field.id}_${idx}`} className="text-[#009197]" />
                        <Label htmlFor={`${field.id}_${idx}`} className="cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </div>
                )}

                {field.type === 'checkbox' && (
                  <div className="space-y-2">
                    {field.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="checkbox" id={`${field.id}_${idx}`} className="text-[#009197]" />
                        <Label htmlFor={`${field.id}_${idx}`} className="cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Button className="w-full bg-gradient-to-r from-[#004645] to-[#009197] text-white">
              Envoyer ma réponse
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Edit Mode */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Champs du formulaire */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645] flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Champs du formulaire
                </CardTitle>
                <CardDescription>
                  Ajoutez et organisez les champs de votre formulaire RSVP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border border-[#9CD9F6]/30 rounded-lg bg-white space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-[#004645]/40 cursor-move" />
                        <div className="space-y-1 flex-1">
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="font-medium border-[#9CD9F6]/30"
                            placeholder="Libellé du champ"
                          />
                          <div className="flex items-center gap-2 text-sm text-[#004645]/70">
                            <span className="capitalize">{field.type}</span>
                            {field.required && <span className="text-[#FF4713]">• Obligatoire</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveField(index, 'up')}
                            className="text-[#004645]/70"
                          >
                            ↑
                          </Button>
                        )}
                        {index < fields.length - 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveField(index, 'down')}
                            className="text-[#004645]/70"
                          >
                            ↓
                          </Button>
                        )}
                        {field.id !== 'attending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(field.id)}
                            className="text-[#FF4713] hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'textarea') && (
                        <div>
                          <Label className="text-xs">Placeholder</Label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            className="border-[#9CD9F6]/30"
                            placeholder="Texte d'exemple..."
                          />
                        </div>
                      )}

                      <div>
                        <Label className="text-xs">Description (optionnel)</Label>
                        <Input
                          value={field.description || ''}
                          onChange={(e) => updateField(field.id, { description: e.target.value })}
                          className="border-[#9CD9F6]/30"
                          placeholder="Aide ou instruction..."
                        />
                      </div>
                    </div>

                    {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                      <div>
                        <Label className="text-xs">Options (une par ligne)</Label>
                        <Textarea
                          value={field.options?.join('\n') || ''}
                          onChange={(e) => updateField(field.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                          className="border-[#9CD9F6]/30"
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={3}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        disabled={field.id === 'attending'}
                      />
                      <Label className="text-sm cursor-pointer">Champ obligatoire</Label>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-[#9CD9F6]/30">
                  <p className="text-sm font-medium text-[#004645] mb-3">Ajouter un champ :</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => addField('text')} className="border-[#9CD9F6]/30">
                      <User className="h-4 w-4 mr-1" /> Texte
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('email')} className="border-[#9CD9F6]/30">
                      <Mail className="h-4 w-4 mr-1" /> Email
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('phone')} className="border-[#9CD9F6]/30">
                      <Phone className="h-4 w-4 mr-1" /> Téléphone
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('textarea')} className="border-[#9CD9F6]/30">
                      <MessageSquare className="h-4 w-4 mr-1" /> Texte long
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('select')} className="border-[#9CD9F6]/30">
                      <List className="h-4 w-4 mr-1" /> Liste déroulante
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('radio')} className="border-[#9CD9F6]/30">
                      <CheckSquare className="h-4 w-4 mr-1" /> Choix unique
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('checkbox')} className="border-[#9CD9F6]/30">
                      <CheckSquare className="h-4 w-4 mr-1" /> Choix multiples
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('number')} className="border-[#9CD9F6]/30">
                      <Users className="h-4 w-4 mr-1" /> Nombre
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Options avancées */}
          <div className="space-y-4">
            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645] flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Options avancées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Autoriser +1</Label>
                    <p className="text-xs text-[#004645]/70">Les invités peuvent amener des accompagnants</p>
                  </div>
                  <Switch
                    checked={config.allowPlusOne}
                    onCheckedChange={(checked) => setConfig({ ...config, allowPlusOne: checked })}
                  />
                </div>

                {config.allowPlusOne && (
                  <div>
                    <Label className="text-sm">Nombre max de +1</Label>
                    <Input
                      type="number"
                      value={config.maxPlusOnes}
                      onChange={(e) => setConfig({ ...config, maxPlusOnes: parseInt(e.target.value) })}
                      className="border-[#9CD9F6]/30"
                      min="1"
                      max="10"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Choix du menu</Label>
                    <p className="text-xs text-[#004645]/70">Demander les préférences alimentaires</p>
                  </div>
                  <Switch
                    checked={config.collectMealChoice}
                    onCheckedChange={(checked) => setConfig({ ...config, collectMealChoice: checked })}
                  />
                </div>

                {config.collectMealChoice && (
                  <div>
                    <Label className="text-sm">Options de menu</Label>
                    <Textarea
                      value={config.mealOptions.join('\n')}
                      onChange={(e) => setConfig({ ...config, mealOptions: e.target.value.split('\n').filter(o => o.trim()) })}
                      className="border-[#9CD9F6]/30"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Régimes alimentaires</Label>
                    <p className="text-xs text-[#004645]/70">Allergies, intolérances...</p>
                  </div>
                  <Switch
                    checked={config.collectDietaryRestrictions}
                    onCheckedChange={(checked) => setConfig({ ...config, collectDietaryRestrictions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Hébergement</Label>
                    <p className="text-xs text-[#004645]/70">Besoin d&apos;un hébergement</p>
                  </div>
                  <Switch
                    checked={config.collectAccommodation}
                    onCheckedChange={(checked) => setConfig({ ...config, collectAccommodation: checked })}
                  />
                </div>

                <div>
                  <Label className="text-sm">Date limite de réponse</Label>
                  <Input
                    type="date"
                    value={config.deadlineDate}
                    onChange={(e) => setConfig({ ...config, deadlineDate: e.target.value })}
                    className="border-[#9CD9F6]/30"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-[#004645]">Messages de confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Message si présent</Label>
                  <Textarea
                    value={config.confirmationMessage}
                    onChange={(e) => setConfig({ ...config, confirmationMessage: e.target.value })}
                    className="border-[#9CD9F6]/30"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-sm">Message si absent</Label>
                  <Textarea
                    value={config.declineMessage}
                    onChange={(e) => setConfig({ ...config, declineMessage: e.target.value })}
                    className="border-[#9CD9F6]/30"
                    rows={3}
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
