"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail, QrCode, Users, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Invitation Manager
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/admin">
              <Button>Espace Admin</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vos invitations, en toute fluidité
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Gérez vos événements professionnels avec élégance. Envoyez des invitations personnalisées,
            suivez les réponses en temps réel et simplifiez votre logistique.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/admin">
              <Button size="lg" className="text-lg px-8">
                Démarrer gratuitement
              </Button>
            </Link>
            <Link href="/guest/demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Voir une démo
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités principales</h2>
          <p className="text-gray-600">Tout ce dont vous avez besoin pour gérer vos événements</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Gestion des invités</CardTitle>
                <CardDescription>
                  Importez vos contacts, créez des groupes et personnalisez vos invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Import CSV/Excel
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tags et segmentation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Liens personnalisés sécurisés
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Emails automatisés</CardTitle>
                <CardDescription>
                  Envoyez des invitations élégantes et suivez les interactions en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Templates personnalisables
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Rappels automatiques
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Suivi des ouvertures
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <QrCode className="h-12 w-12 text-primary mb-4" />
                <CardTitle>QR Codes & Check-in</CardTitle>
                <CardDescription>
                  Simplifiez l&apos;accueil avec des QR codes uniques pour chaque invité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    QR codes automatiques
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Scan à l&apos;entrée
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Feuille d&apos;émargement
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 bg-white/50 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
          <p className="text-gray-600">En 3 étapes simples</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Créez votre événement</h3>
            <p className="text-gray-600">
              Renseignez les détails : date, lieu, programme, options RSVP
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Importez vos invités</h3>
            <p className="text-gray-600">
              Ajoutez vos contacts via CSV ou manuellement, et envoyez les invitations
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Suivez les réponses</h3>
            <p className="text-gray-600">
              Dashboard en temps réel, exports, et check-in le jour J
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-6">Prêt à simplifier vos événements ?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez les organisateurs qui font confiance à Invitation Manager
          </p>
          <Link href="/admin">
            <Button size="lg" className="text-lg px-12">
              Commencer maintenant
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">© 2025 Invitation Manager. Tous droits réservés.</p>
          <div className="flex justify-center space-x-6">
            <Link href="/legal" className="hover:text-primary">
              Mentions légales
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Politique de confidentialité
            </Link>
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
