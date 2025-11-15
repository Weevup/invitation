import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DOMPurify from 'isomorphic-dompurify'
import Image from 'next/image'

interface SectionContent {
  title?: string
  subtitle?: string
  description?: string
  image?: string
  buttons?: Array<{
    text: string
    link: string
    style: 'primary' | 'secondary' | 'outline'
  }>
  customHTML?: string
}

interface CustomSectionContentProps {
  content: SectionContent
  primaryColor: string
  secondaryColor: string
  defaultTitle?: string
}

export function CustomSectionContent({
  content,
  primaryColor,
  secondaryColor,
  defaultTitle
}: CustomSectionContentProps) {
  if (!content || (!content.title && !content.subtitle && !content.description && !content.image && !content.buttons?.length && !content.customHTML)) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Titre personnalisé */}
      {content.title && (
        <h2
          className="text-3xl md:text-4xl font-bold"
          style={{
            fontFamily: "var(--font-abril)",
            color: primaryColor
          }}
        >
          {content.title}
        </h2>
      )}

      {/* Sous-titre */}
      {content.subtitle && (
        <p
          className="text-xl md:text-2xl font-medium"
          style={{ color: `${primaryColor}cc` }}
        >
          {content.subtitle}
        </p>
      )}

      {/* Image */}
      {content.image && (
        <div className="rounded-lg overflow-hidden shadow-xl relative w-full" style={{ aspectRatio: '16/9' }}>
          <Image
            src={content.image}
            alt={content.title || defaultTitle || ''}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        </div>
      )}

      {/* Description */}
      {content.description && (
        <div
          className="prose max-w-none text-lg"
          style={{ color: `${primaryColor}dd` }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              content.description.replace(/\n/g, '<br/>'),
              {
                ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'a'],
                ALLOWED_ATTR: ['href', 'target', 'rel'],
              }
            )
          }}
        />
      )}

      {/* Boutons CTA */}
      {content.buttons && content.buttons.length > 0 && (
        <div className="flex flex-wrap gap-4 pt-4">
          {content.buttons.map((button, index) => {
            const buttonStyles = {
              primary: {
                backgroundColor: secondaryColor,
                color: '#ffffff',
                border: 'none',
              },
              secondary: {
                backgroundColor: primaryColor,
                color: '#ffffff',
                border: 'none',
              },
              outline: {
                backgroundColor: 'transparent',
                color: primaryColor,
                border: `2px solid ${primaryColor}`,
              },
            }

            const style = buttonStyles[button.style] || buttonStyles.primary

            return (
              <Link key={index} href={button.link} target={button.link.startsWith('http') ? '_blank' : undefined} rel={button.link.startsWith('http') ? 'noopener noreferrer' : undefined}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  style={style}
                >
                  {button.text}
                </Button>
              </Link>
            )
          })}
        </div>
      )}

      {/* HTML personnalisé */}
      {content.customHTML && (
        <div
          className="mt-6"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(content.customHTML, {
              ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'div', 'span', 'a', 'img'],
              ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style'],
            })
          }}
        />
      )}
    </div>
  )
}
