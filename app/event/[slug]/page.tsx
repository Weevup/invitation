import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, MapPin, Clock, Users, MessageCircle, Image as ImageIcon, Play, User, Building2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WeevupLogo } from '@/components/weevup-logo'
import { CountdownTimer } from '@/components/countdown-timer'
import { ScrollReveal } from '@/components/scroll-reveal'
import Link from 'next/link'
import { migrateLegacySections, getActiveSections, getSectionWrapperProps } from '@/lib/showcase-utils'
import { type SectionConfig } from '@/lib/showcase-templates'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

interface SectionWrapperProps {
  section: SectionConfig
  children: React.ReactNode
}

function SectionWrapper({ section, children }: SectionWrapperProps) {
  const props = getSectionWrapperProps(section)

  return (
    <section
      className={`relative ${props.className}`}
      style={{
        ...props.style,
        animationDelay: `${props.animationDelay}ms`,
        animationDuration: props.animationDuration,
      }}
    >
      {/* Overlay si image de fond */}
      {props.hasOverlay && (
        <div
          className="absolute inset-0 bg-black z-0"
          style={{ opacity: props.overlayOpacity / 100 }}
        />
      )}

      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  )
}

async function getEvent(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          guests: true,
          rsvps: { where: { attending: true } },
        },
      },
    },
  })

  return event
}

export default async function EventShowcasePage({ params }: PageProps) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event || !event.showcaseEnabled) {
    notFound()
  }

  // Migrate and get active sections
  const defaultSections = ['hero', 'description', 'details', 'cta']
  const rawSections = event.showcaseSections || defaultSections
  const sectionConfigs = migrateLegacySections(rawSections)
  const activeSections = getActiveSections(sectionConfigs)

  // Theme colors
  const primaryColor = event.showcasePrimaryColor || '#004645'
  const secondaryColor = event.showcaseSecondaryColor || '#FF4713'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6]">
      {/* Custom CSS if provided */}
      {event.showcaseCustomCSS && (
        <style dangerouslySetInnerHTML={{ __html: event.showcaseCustomCSS }} />
      )}

      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 right-0 w-1/4 h-1/4" viewBox="0 0 200 200">
          <path
            d="M 0 50 Q 50 50, 50 100 T 100 150 T 150 200"
            stroke={secondaryColor}
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      <div className="relative">
        {/* Render all active sections */}
        {activeSections.map((sectionConfig) => {
          // Hero Section
          if (sectionConfig.type === 'hero') {
            return (
              <SectionWrapper key={sectionConfig.id} section={sectionConfig}>
                {/* Background avec gradient overlay */}
                {event.showcaseBannerImage && !sectionConfig.backgroundImage && (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center z-0"
                      style={{ backgroundImage: `url(${event.showcaseBannerImage})` }}
                    />
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}E6 0%, ${primaryColor}CC 50%, ${secondaryColor}CC 100%)`
                      }}
                    />
                  </>
                )}
                {!event.showcaseBannerImage && !sectionConfig.backgroundImage && (
                  <div
                    className="absolute inset-0 z-0"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}10 100%)`
                    }}
                  />
                )}

                {/* Decorative circles */}
                <div className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-10 z-0" style={{ backgroundColor: secondaryColor }} />
                <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full opacity-10 z-0" style={{ backgroundColor: primaryColor }} />

                <div className="container mx-auto px-4 py-20 md:py-32">
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="mb-8 animate-bounce-slow">
                      <WeevupLogo className="w-20 h-20 mx-auto drop-shadow-2xl" />
                    </div>
                    <h1
                      className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in drop-shadow-lg"
                      style={{
                        fontFamily: "var(--font-abril)",
                        color: (event.showcaseBannerImage || sectionConfig.backgroundImage) ? '#ffffff' : primaryColor
                      }}
                    >
                      {event.showcaseTitle || event.name}
                    </h1>
                    {event.showcaseSubtitle && (
                      <p
                        className="text-xl md:text-3xl mb-10 font-medium"
                        style={{ color: (event.showcaseBannerImage || sectionConfig.backgroundImage) ? '#ffffffdd' : `${primaryColor}99` }}
                      >
                        {event.showcaseSubtitle}
                      </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-6 text-lg">
                      <div
                        className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm shadow-lg"
                        style={{
                          backgroundColor: (event.showcaseBannerImage || sectionConfig.backgroundImage) ? '#ffffff20' : `${primaryColor}10`,
                          color: (event.showcaseBannerImage || sectionConfig.backgroundImage) ? '#ffffff' : primaryColor
                        }}
                      >
                        <Calendar className="h-6 w-6" />
                        <span className="font-semibold">{format(new Date(event.startsAt), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <div
                        className="flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm shadow-lg"
                        style={{
                          backgroundColor: (event.showcaseBannerImage || sectionConfig.backgroundImage) ? '#ffffff20' : `${primaryColor}10`,
                          color: (event.showcaseBannerImage || sectionConfig.backgroundImage) ? '#ffffff' : primaryColor
                        }}
                      >
                        <Clock className="h-6 w-6" />
                        <span className="font-semibold">{format(new Date(event.startsAt), 'HH:mm', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionWrapper>
            )
          }

          return null
        })}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="space-y-12">
            {activeSections.map((sectionConfig) => {
              // Skip hero as it's already rendered outside
              if (sectionConfig.type === 'hero') return null

              // Countdown Section
              if (sectionConfig.type === 'countdown' && event.showcaseCountdown) {
                return (
                  <ScrollReveal key={sectionConfig.id}>
                    <Card className="border-2 border-transparent bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all duration-500">
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                          background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                        }}
                      />
                      <CardContent className="pt-8">
                        <h2
                          className="text-3xl font-bold mb-8 text-center"
                          style={{
                            fontFamily: "var(--font-abril)",
                            color: primaryColor
                          }}
                        >
                          L&apos;événement commence dans
                        </h2>
                        <CountdownTimer
                          targetDate={event.startsAt}
                          primaryColor={primaryColor}
                          secondaryColor={secondaryColor}
                        />
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              }

              // Description Section
              if (sectionConfig.type === 'description' && event.description) {
                return (
                  <Card key={sectionConfig.id} className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                    <CardContent className="pt-6">
                      <h2
                        className="text-2xl font-bold mb-4"
                        style={{
                          fontFamily: "var(--font-abril)",
                          color: primaryColor
                        }}
                      >
                        À propos de l&apos;événement
                      </h2>
                      <div
                        className="prose max-w-none"
                        style={{ color: `${primaryColor}cc` }}
                        dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, '<br/>') }}
                      />
                    </CardContent>
                  </Card>
                )
              }

              // Program Section
              if (sectionConfig.type === 'program' && event.program) {
                return (
                  <ScrollReveal key={sectionConfig.id}>
                    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                      <CardContent className="pt-6">
                        <h2
                          className="text-2xl font-bold mb-4"
                          style={{
                            fontFamily: "var(--font-abril)",
                            color: primaryColor
                          }}
                        >
                          Programme
                        </h2>
                        <div
                          className="prose max-w-none"
                          style={{ color: `${primaryColor}cc` }}
                          dangerouslySetInnerHTML={{ __html: event.program.replace(/\n/g, '<br/>') }}
                        />
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              }

              // Video Section
              if (sectionConfig.type === 'video' && event.showcaseVideo) {
                return (
                  <ScrollReveal key={sectionConfig.id}>
                    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Play className="h-6 w-6" style={{ color: secondaryColor }} />
                          <h2
                            className="text-2xl font-bold"
                            style={{
                              fontFamily: "var(--font-abril)",
                              color: primaryColor
                            }}
                          >
                            Vidéo
                          </h2>
                        </div>
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                          {event.showcaseVideo.includes('youtube.com') || event.showcaseVideo.includes('youtu.be') ? (
                            <iframe
                              src={event.showcaseVideo.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : event.showcaseVideo.includes('vimeo.com') ? (
                            <iframe
                              src={event.showcaseVideo.replace('vimeo.com/', 'player.vimeo.com/video/')}
                              className="w-full h-full"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              Format vidéo non supporté
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              }

              // Gallery Section
              if (sectionConfig.type === 'gallery' && event.showcaseGallery && (event.showcaseGallery as string[]).length > 0) {
                return (
                  <ScrollReveal key={sectionConfig.id}>
                    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-6">
                          <ImageIcon className="h-6 w-6" style={{ color: secondaryColor }} />
                          <h2
                            className="text-2xl font-bold"
                            style={{
                              fontFamily: "var(--font-abril)",
                              color: primaryColor
                            }}
                          >
                            Galerie
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {(event.showcaseGallery as string[]).map((url, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              }

              // FAQ Section
              if (sectionConfig.type === 'faq' && event.showcaseFAQ && (event.showcaseFAQ as Array<{question: string; answer: string}>).length > 0) {
                return (
                  <ScrollReveal key={sectionConfig.id}>
                    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-6">
                          <MessageCircle className="h-6 w-6" style={{ color: secondaryColor }} />
                          <h2
                            className="text-2xl font-bold"
                            style={{
                              fontFamily: "var(--font-abril)",
                              color: primaryColor
                            }}
                          >
                            Questions fréquentes
                          </h2>
                        </div>
                        <div className="space-y-4">
                          {(event.showcaseFAQ as Array<{question: string; answer: string}>).map((faq, index) => (
                            <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: secondaryColor }}>
                              <h3 className="font-bold mb-2" style={{ color: primaryColor }}>
                                {faq.question}
                              </h3>
                              <p style={{ color: `${primaryColor}cc` }}>
                                {faq.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              }

              // Details Section
              if (sectionConfig.type === 'details') {
                return (
                  <div key={sectionConfig.id} className="grid md:grid-cols-2 gap-6">
                    {/* Location */}
                    {(event.venueName || event.address) && (
                      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-6 w-6 flex-shrink-0" style={{ color: secondaryColor }} />
                            <div>
                              <h3
                                className="font-bold mb-2"
                                style={{ color: primaryColor }}
                              >
                                Lieu
                              </h3>
                              {event.venueName && (
                                <p className="font-medium" style={{ color: primaryColor }}>
                                  {event.venueName}
                                </p>
                              )}
                              {event.address && (
                                <p className="text-sm" style={{ color: `${primaryColor}99` }}>
                                  {event.address}
                                </p>
                              )}
                              {event.city && (
                                <p className="text-sm" style={{ color: `${primaryColor}99` }}>
                                  {event.city}{event.country && `, ${event.country}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Date & Time */}
                    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-6 w-6 flex-shrink-0" style={{ color: secondaryColor }} />
                          <div>
                            <h3
                              className="font-bold mb-2"
                              style={{ color: primaryColor }}
                            >
                              Date et heure
                            </h3>
                            <p className="font-medium" style={{ color: primaryColor }}>
                              {format(new Date(event.startsAt), 'EEEE d MMMM yyyy', { locale: fr })}
                            </p>
                            <p className="text-sm" style={{ color: `${primaryColor}99` }}>
                              {format(new Date(event.startsAt), 'HH:mm', { locale: fr })}
                              {event.endsAt && ` - ${format(new Date(event.endsAt), 'HH:mm', { locale: fr })}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Dress Code */}
                    {event.dressCode && (
                      <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <Users className="h-6 w-6 flex-shrink-0" style={{ color: secondaryColor }} />
                            <div>
                              <h3
                                className="font-bold mb-2"
                                style={{ color: primaryColor }}
                              >
                                Code vestimentaire
                              </h3>
                              <p style={{ color: `${primaryColor}cc` }}>
                                {event.dressCode}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              }

              // Speakers Section
              if (sectionConfig.type === 'speakers' && event.showcaseSpeakers && (event.showcaseSpeakers as Array<{name: string; title: string; bio: string; photo: string}>).length > 0) {
                return (
                  <ScrollReveal key={sectionConfig.id}>
                    <Card className="border-2 border-transparent bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl shadow-xl overflow-hidden relative hover:shadow-2xl transition-all duration-500">
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                          background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                        }}
                      />
                      <CardContent className="pt-8">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${secondaryColor}20` }}>
                            <User className="h-6 w-6" style={{ color: secondaryColor }} />
                          </div>
                          <h2
                            className="text-3xl font-bold"
                            style={{
                              fontFamily: "var(--font-abril)",
                              color: primaryColor
                            }}
                          >
                            Speakers & Intervenants
                          </h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {(event.showcaseSpeakers as Array<{name: string; title: string; bio: string; photo: string}>).map((speaker, index) => (
                            <div key={index} className="text-center group">
                              <div className="relative mb-4 inline-block">
                                {speaker.photo ? (
                                  <img
                                    src={speaker.photo}
                                    alt={speaker.name}
                                    className="w-36 h-36 rounded-full object-cover mx-auto border-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                                    style={{ borderColor: `${secondaryColor}40` }}
                                  />
                                ) : (
                                  <div
                                    className="w-36 h-36 rounded-full mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                                    style={{ backgroundColor: `${secondaryColor}20` }}
                                  >
                                    <User className="h-20 w-20" style={{ color: secondaryColor }} />
                                  </div>
                                )}
                                <div
                                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                                  style={{ backgroundColor: secondaryColor }}
                                >
                                  <span className="text-white font-bold text-xs">{index + 1}</span>
                                </div>
                              </div>
                              <h3 className="font-bold text-xl mb-1" style={{ color: primaryColor }}>
                                {speaker.name}
                              </h3>
                              <p className="text-sm font-semibold mb-3 px-3 py-1 rounded-full inline-block" style={{ color: secondaryColor, backgroundColor: `${secondaryColor}15` }}>
                                {speaker.title}
                              </p>
                              {speaker.bio && (
                                <p className="text-sm text-left leading-relaxed" style={{ color: `${primaryColor}99` }}>
                                  {speaker.bio}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              }

              // Timeline Section
              if (sectionConfig.type === 'timeline' && event.showcaseTimeline && (event.showcaseTimeline as Array<{time: string; title: string; description: string}>).length > 0) {
                return (
                  <ScrollReveal key={sectionConfig.id}>
                    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-6">
                          <Clock className="h-6 w-6" style={{ color: secondaryColor }} />
                          <h2
                            className="text-2xl font-bold"
                            style={{
                              fontFamily: "var(--font-abril)",
                              color: primaryColor
                            }}
                          >
                            Déroulé de l&apos;événement
                          </h2>
                        </div>
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#9CD9F6]" />
                          <div className="space-y-6">
                            {(event.showcaseTimeline as Array<{time: string; title: string; description: string}>)
                              .sort((a, b) => a.time.localeCompare(b.time))
                              .map((item, index) => (
                                <div key={index} className="relative pl-12">
                                  <div
                                    className="absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white"
                                    style={{ backgroundColor: secondaryColor }}
                                  >
                                    <Clock className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-bold mb-1" style={{ color: secondaryColor }}>
                                      {item.time}
                                    </p>
                                    <h3 className="font-bold text-lg mb-1" style={{ color: primaryColor }}>
                                      {item.title}
                                    </h3>
                                    {item.description && (
                                      <p className="text-sm" style={{ color: `${primaryColor}99` }}>
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              }

              // Sponsors Section
              if (sectionConfig.type === 'sponsors' && event.showcaseSponsors && (event.showcaseSponsors as Array<{name: string; logo: string; website: string; tier: string}>).length > 0) {
                return (
                  <ScrollReveal key={sectionConfig.id}>
                    <Card className="border-[#9CD9F6]/30 bg-white/80 backdrop-blur">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-6">
                          <Building2 className="h-6 w-6" style={{ color: secondaryColor }} />
                          <h2
                            className="text-2xl font-bold"
                            style={{
                              fontFamily: "var(--font-abril)",
                              color: primaryColor
                            }}
                          >
                            Nos Sponsors & Partenaires
                          </h2>
                        </div>
                        {['platinum', 'gold', 'silver', 'bronze'].map(tier => {
                          const tierSponsors = (event.showcaseSponsors as Array<{name: string; logo: string; website: string; tier: string}>).filter(s => s.tier === tier)
                          if (tierSponsors.length === 0) return null

                          const tierLabels: Record<string, string> = {
                            platinum: 'Partenaires Platine',
                            gold: 'Partenaires Or',
                            silver: 'Partenaires Argent',
                            bronze: 'Partenaires Bronze',
                          }

                          return (
                            <div key={tier} className="mb-8 last:mb-0">
                              <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: primaryColor }}>
                                {tierLabels[tier]}
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {tierSponsors.map((sponsor, index) => (
                                  <div key={index} className="flex flex-col items-center">
                                    {sponsor.website ? (
                                      <a
                                        href={sponsor.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full hover:scale-105 transition-transform"
                                      >
                                        <div className="aspect-video bg-white rounded-lg p-4 flex items-center justify-center border border-[#9CD9F6]/30">
                                          {sponsor.logo ? (
                                            <img src={sponsor.logo} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                                          ) : (
                                            <span className="text-center font-semibold" style={{ color: primaryColor }}>{sponsor.name}</span>
                                          )}
                                        </div>
                                      </a>
                                    ) : (
                                      <div className="aspect-video bg-white rounded-lg p-4 flex items-center justify-center border border-[#9CD9F6]/30">
                                        {sponsor.logo ? (
                                          <img src={sponsor.logo} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                                        ) : (
                                          <span className="text-center font-semibold" style={{ color: primaryColor }}>{sponsor.name}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              }

              // Call to Action
              if (sectionConfig.type === 'cta') {
                return (
                  <Card
                    key={sectionConfig.id}
                    className="border-2 bg-gradient-to-br from-white to-[#9CD9F6]/10 backdrop-blur"
                    style={{ borderColor: `${secondaryColor}50` }}
                  >
                    <CardContent className="pt-6 text-center">
                      <h2
                        className="text-2xl font-bold mb-4"
                        style={{
                          fontFamily: "var(--font-abril)",
                          color: primaryColor
                        }}
                      >
                        Vous êtes invité ?
                      </h2>
                      <p className="mb-6" style={{ color: `${primaryColor}99` }}>
                        Si vous avez reçu une invitation, cliquez sur le lien dans votre email pour confirmer votre présence.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                          <Button
                            size="lg"
                            className="text-white"
                            style={{
                              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                            }}
                          >
                            Retour à l&apos;accueil
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              return null
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative border-t border-[#9CD9F6]/30 bg-white/60 backdrop-blur mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <WeevupLogo className="w-8 h-8" />
                <span
                  className="font-bold"
                  style={{
                    fontFamily: "var(--font-abril)",
                    color: primaryColor
                  }}
                >
                  WEEVUP
                </span>
              </div>
              <p className="text-sm" style={{ color: `${primaryColor}99` }}>
                Powered by Weevup Events
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
