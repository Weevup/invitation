'use client'

import { type BadgeTemplate } from '@/lib/badge-generator'

interface BadgePreviewProps {
  template: BadgeTemplate
  className?: string
}

export function BadgePreview({ template, className = '' }: BadgePreviewProps) {
  const isPortrait = template.orientation === 'PORTRAIT'
  const isDark =
    template.layout.backgroundColor === '#1a1a1a' ||
    template.layout.backgroundColor === '#1e293b' ||
    template.layout.backgroundColor === '#004645'

  // Sample data for preview
  const sampleData = {
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    company: 'Weevup',
    jobTitle: 'Product Manager',
    email: 'john.doe@weevup.com',
  }

  return (
    <div
      className={`relative rounded-lg border-2 overflow-hidden ${className}`}
      style={{
        aspectRatio: isPortrait ? '5/7' : '7/5',
        backgroundColor: template.layout.backgroundColor || '#ffffff',
        borderColor: template.layout.borderColor || '#e5e7eb',
      }}
    >
      {/* Background sections if any */}
      {template.layout.sections?.map((section, idx) => {
        const sectionHeight = `${(section.height / (isPortrait ? 350 : 250)) * 100}%`
        return (
          <div
            key={idx}
            style={{
              backgroundColor: section.backgroundColor,
              height: sectionHeight,
              borderBottom: section.borderColor ? `${section.borderWidth || 1}px solid ${section.borderColor}` : 'none',
            }}
          />
        )
      })}

      {/* Fields preview */}
      <div className="absolute inset-0 p-3">
        {template.fields.slice(0, 6).map((field, idx) => {
          // Calculate relative positioning
          const fieldStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${(field.x / (isPortrait ? 300 : 500)) * 100}%`,
            top: `${(field.y / (isPortrait ? 400 : 300)) * 100}%`,
            fontSize: field.fontSize ? `${Math.max(field.fontSize / 20, 0.5)}rem` : '0.75rem',
            fontWeight: field.fontWeight || 'normal',
            color: field.color || (isDark ? '#ffffff' : '#000000'),
            textAlign: field.textAlign || 'left',
            maxWidth: field.width ? `${(field.width / (isPortrait ? 300 : 500)) * 100}%` : '80%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }

          let content = ''
          switch (field.type) {
            case 'FULL_NAME':
              content = sampleData.fullName
              break
            case 'FIRST_NAME':
              content = sampleData.firstName
              break
            case 'LAST_NAME':
              content = sampleData.lastName
              break
            case 'COMPANY':
              content = sampleData.company
              break
            case 'JOB_TITLE':
              content = sampleData.jobTitle
              break
            case 'EMAIL':
              content = sampleData.email
              break
            case 'EVENT_NAME':
              content = 'Event Name'
              break
            case 'EVENT_DATE':
              content = '15 Nov 2025'
              break
            case 'CUSTOM_TEXT':
              content = field.customText || 'Text'
              break
            case 'QR_CODE':
              return (
                <div
                  key={idx}
                  style={{
                    ...fieldStyle,
                    width: `${((field.size || 80) / (isPortrait ? 300 : 500)) * 100}%`,
                    aspectRatio: '1',
                  }}
                >
                  <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center text-xs text-white">
                    QR
                  </div>
                </div>
              )
            case 'PHOTO':
              return (
                <div
                  key={idx}
                  style={{
                    ...fieldStyle,
                    width: `${((field.width || 100) / (isPortrait ? 300 : 500)) * 100}%`,
                    height: `${((field.height || 100) / (isPortrait ? 400 : 300)) * 100}%`,
                  }}
                >
                  <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center">
                    <svg className="w-1/2 h-1/2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )
            case 'LOGO':
              return (
                <div
                  key={idx}
                  style={{
                    ...fieldStyle,
                    width: `${((field.width || 60) / (isPortrait ? 300 : 500)) * 100}%`,
                    height: `${((field.height || 30) / (isPortrait ? 400 : 300)) * 100}%`,
                  }}
                >
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                    Logo
                  </div>
                </div>
              )
            default:
              content = field.type
          }

          if (!content) return null

          return (
            <div key={idx} style={fieldStyle}>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
