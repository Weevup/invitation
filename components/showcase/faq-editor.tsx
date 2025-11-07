"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, MessageCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQEditorProps {
  faqs: FAQItem[]
  onChange: (faqs: FAQItem[]) => void
}

export function FAQEditor({ faqs, onChange }: FAQEditorProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const addFAQ = () => {
    if (question.trim() && answer.trim()) {
      onChange([...faqs, { question: question.trim(), answer: answer.trim() }])
      setQuestion('')
      setAnswer('')
    }
  }

  const removeFAQ = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#9CD9F6]/30 bg-[#9CD9F6]/5">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="faq-question">Question</Label>
            <Input
              id="faq-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Quelle est la question ?"
              className="border-[#9CD9F6]/30"
            />
          </div>
          <div>
            <Label htmlFor="faq-answer">Réponse</Label>
            <Textarea
              id="faq-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="La réponse à cette question..."
              rows={3}
              className="border-[#9CD9F6]/30"
            />
          </div>
          <Button
            type="button"
            onClick={addFAQ}
            className="w-full bg-[#009197] hover:bg-[#004645]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter la FAQ
          </Button>
        </CardContent>
      </Card>

      {faqs.length > 0 ? (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index} className="border-[#9CD9F6]/30 group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-2">
                  <MessageCircle className="h-5 w-5 text-[#FF4713] flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#004645]">{faq.question}</p>
                    <p className="text-sm text-[#004645]/70 mt-1">{faq.answer}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFAQ(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>Aucune FAQ ajoutée</p>
        </div>
      )}
    </div>
  )
}
