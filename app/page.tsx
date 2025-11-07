"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Mail, QrCode, Users, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { WeevupLogo } from "@/components/weevup-logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9CD9F6] via-white to-[#9CD9F6]">
      {/* Lignes graphiques orange décoratives */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 right-0 w-1/3 h-1/3" viewBox="0 0 200 200">
          <path
            d="M 0 50 Q 50 50, 50 100 T 100 150 T 150 200"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M 0 60 Q 50 60, 50 110 T 100 160 T 150 210"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M 0 70 Q 50 70, 50 120 T 100 170 T 150 220"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
        <svg className="absolute bottom-0 left-0 w-1/3 h-1/3" viewBox="0 0 200 200">
          <path
            d="M 200 150 Q 150 150, 150 100 T 100 50 T 50 0"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M 200 140 Q 150 140, 150 90 T 100 40 T 50 -10"
            stroke="#FF4713"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Header */}
      <header className="relative container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <WeevupLogo className="w-12 h-12" />
            <div>
              <span className="text-2xl font-bold text-[#004645]" style={{ fontFamily: "var(--font-abril)" }}>
                WEEVUP
              </span>
              <p className="text-xs text-[#004645]/70">Invitation Manager</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button
                className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white"
              >
                Espace Admin
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-[#FF4713] animate-pulse" />
              <Sparkles className="absolute -bottom-4 -right-4 w-6 h-6 text-[#FF4713] animate-pulse delay-150" />
              <div className="bg-gradient-to-r from-[#004645] via-[#009197] to-[#9CD9F6] p-8 rounded-3xl">
                <WeevupLogo className="w-32 h-32 mx-auto" />
              </div>
            </div>
          </div>

          <h1
            className="text-6xl md:text-7xl font-bold mb-6 text-[#004645]"
            style={{ fontFamily: "var(--font-abril)" }}
          >
            L&apos;agence créatrice
            <br />
            <span className="text-[#FF4713]">d&apos;émotions durables</span>
          </h1>

          <p className="text-xl text-[#004B56] mb-8 max-w-3xl mx-auto leading-relaxed">
            Gérez vos événements avec élégance et simplicité.
            Une plateforme complète pour vos invitations, RSVP et check-in.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/admin/setup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#004645] to-[#009197] hover:from-[#006C51] hover:to-[#009197] text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Démarrer maintenant
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-2 border-[#004645] text-[#004645] hover:bg-[#004645] hover:text-white transition-all"
              >
                Voir la démo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "10+", label: "Années d'expertise" },
              { value: "1000+", label: "Événements réussis" },
              { value: "50K+", label: "Invitations envoyées" },
              { value: "98%", label: "Satisfaction client" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#9CD9F6]/30"
              >
                <p
                  className="text-3xl font-bold text-[#004645] mb-1"
                  style={{ fontFamily: "var(--font-abril)" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-[#004645]/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2
            className="text-5xl font-bold mb-4 text-[#004645]"
            style={{ fontFamily: "var(--font-abril)" }}
          >
            Fonctionnalités
            <span className="text-[#FF4713]"> complètes</span>
          </h2>
          <p className="text-lg text-[#004B56]/80">
            Tout ce dont vous avez besoin pour des événements réussis
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Users,
              title: "Gestion des invités",
              description: "Import CSV, ajout manuel, tags et segmentation avancée",
              features: [
                "Import/Export CSV",
                "Liens sécurisés personnalisés",
                "Groupes et tags",
              ],
              color: "from-[#004645] to-[#006C51]",
            },
            {
              icon: Mail,
              title: "Emails automatisés",
              description: "Templates élégants avec suivi en temps réel",
              features: [
                "3 templates professionnels",
                "Rappels automatiques",
                "Tracking des ouvertures",
              ],
              color: "from-[#009197] to-[#9CD9F6]",
            },
            {
              icon: QrCode,
              title: "QR Codes & Check-in",
              description: "Simplifiez l'accueil avec des QR codes uniques",
              features: [
                "QR codes automatiques",
                "Scan à l'entrée",
                "Statistiques en temps réel",
              ],
              color: "from-[#006C51] to-[#009197]",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-none"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative p-8">
                  <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3
                    className="text-2xl font-bold mb-3 text-[#004645]"
                    style={{ fontFamily: "var(--font-abril)" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-[#004B56]/70 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-[#FF4713] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#004645]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-5xl font-bold mb-4 text-[#004645]"
              style={{ fontFamily: "var(--font-abril)" }}
            >
              Comment <span className="text-[#FF4713]">ça marche ?</span>
            </h2>
            <p className="text-lg text-[#004B56]/80">
              En 3 étapes simples, créez votre événement parfait
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-[#004645] via-[#009197] to-[#9CD9F6]" />

            {[
              {
                number: "01",
                icon: Calendar,
                title: "Créez votre événement",
                description: "Renseignez date, lieu, programme et options RSVP",
              },
              {
                number: "02",
                icon: Mail,
                title: "Envoyez les invitations",
                description: "Import CSV ou ajout manuel, puis envoi automatique",
              },
              {
                number: "03",
                icon: CheckCircle,
                title: "Suivez les réponses",
                description: "Dashboard temps réel, exports et check-in jour J",
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative">
                  <div className="text-center">
                    <div className="relative mx-auto mb-6">
                      <div className="bg-gradient-to-br from-[#004645] to-[#009197] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div
                        className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-[#FF4713] flex items-center justify-center text-white font-bold text-sm z-20"
                        style={{ fontFamily: "var(--font-abril)" }}
                      >
                        {step.number}
                      </div>
                    </div>
                    <h3
                      className="text-xl font-bold mb-3 text-[#004645]"
                      style={{ fontFamily: "var(--font-abril)" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[#004B56]/70">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#004645] via-[#009197] to-[#9CD9F6]" />
            <div className="relative p-12 md:p-16 text-center text-white">
              <h2
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ fontFamily: "var(--font-abril)" }}
              >
                Prêt à créer des émotions durables ?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez les organisateurs qui font confiance à Weevup
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/admin/setup">
                  <Button
                    size="lg"
                    className="bg-white text-[#004645] hover:bg-[#9CD9F6] text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    Commencer gratuitement
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#004645] transition-all"
                  >
                    Voir la démo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative container mx-auto px-4 py-12 border-t border-[#9CD9F6]/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <WeevupLogo className="w-8 h-8" />
                <span
                  className="text-xl font-bold text-[#004645]"
                  style={{ fontFamily: "var(--font-abril)" }}
                >
                  WEEVUP
                </span>
              </div>
              <p className="text-sm text-[#004645]/70">
                L&apos;agence créatrice d&apos;émotions durables
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#004645] mb-3">Liens rapides</h4>
              <ul className="space-y-2 text-sm text-[#004645]/70">
                <li><Link href="/admin" className="hover:text-[#FF4713] transition-colors">Espace Admin</Link></li>
                <li><Link href="/admin/setup" className="hover:text-[#FF4713] transition-colors">Commencer</Link></li>
                <li><Link href="/admin/diagnostic" className="hover:text-[#FF4713] transition-colors">Diagnostic</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#004645] mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-[#004645]/70">
                <li><Link href="/legal" className="hover:text-[#FF4713] transition-colors">Mentions légales</Link></li>
                <li><Link href="/privacy" className="hover:text-[#FF4713] transition-colors">Confidentialité</Link></li>
                <li><Link href="/contact" className="hover:text-[#FF4713] transition-colors">Nous contacter</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-[#9CD9F6]/30">
            <p className="text-sm text-[#004645]/60">
              © 2025 Weevup - Invitation Manager. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
