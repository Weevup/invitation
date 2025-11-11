'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Plane,
  Hotel,
  Activity,
  FileSpreadsheet,
  Lightbulb,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  Download,
} from 'lucide-react'
import Link from 'next/link'

export default function DocumentationPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div>
        <Link
          href="/admin/modules-showcase"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux modules
        </Link>
        <div className="flex items-start gap-4 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-primary to-primary/80 p-3">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Documentation & Tutoriels
            </h1>
            <p className="text-muted-foreground">
              Guide complet pour maîtriser tous les modules de planification événement
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Guide de démarrage rapide</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Activez les modules dont vous avez besoin depuis la vue d'ensemble de votre événement
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Activer les modules</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Navigation :</strong> Vue d'ensemble de l'événement → Section "Modules disponibles"
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <strong>Programme & Sessions</strong> : Gérer l'agenda et les inscriptions
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Plane className="h-4 w-4 text-teal-500" />
                  <strong>Transport</strong> : Centraliser les déplacements
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Hotel className="h-4 w-4 text-purple-500" />
                  <strong>Hébergement</strong> : Créer la rooming list
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Action :</strong> Cliquer sur "Activer" pour chaque module souhaité.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Programme */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <Calendar className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">📅 Module PROGRAMME</h2>
          </div>

          <div className="space-y-6">
            {/* Créer une session */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Créer une session</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">1.</span>
                  <span><strong>Accéder :</strong> Navigation sidebar → Programme → Sessions</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">2.</span>
                  <span><strong>Cliquer :</strong> "Nouvelle session"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">3.</span>
                  <div>
                    <strong>Remplir le formulaire :</strong>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• <strong>Titre</strong> : Ex. "Keynote d'ouverture"</li>
                      <li>• <strong>Type</strong> : Choisir parmi 14 types (Keynote, Workshop, Conférence, etc.)</li>
                      <li>• <strong>Date et horaires</strong> : Date, heure début, heure fin</li>
                      <li>• <strong>Lieu</strong> : Venue, salle, adresse si différente</li>
                      <li>• <strong>Capacité</strong> : Nombre maximum de participants (optionnel)</li>
                      <li>• <strong>Inscription obligatoire</strong> : Activer si nécessaire</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">4.</span>
                  <span><strong>Enregistrer</strong></span>
                </li>
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">
                    <strong>Astuce :</strong> La durée est calculée automatiquement. Utilisez les couleurs pour distinguer les types de sessions dans la timeline.
                  </p>
                </div>
              </div>
            </div>

            {/* Gérer les participants */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Gérer les participants d'une session</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">1.</span>
                  <span><strong>Accéder :</strong> Programme → Sessions → Cliquer sur une session</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">2.</span>
                  <span><strong>Cliquer :</strong> "Gérer les participants"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">3.</span>
                  <div>
                    <strong>Ajouter des participants :</strong>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• Rechercher un invité par nom/email</li>
                      <li>• Cliquer pour l'ajouter</li>
                      <li>• Le statut passe à "Inscrit"</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">4.</span>
                  <div>
                    <strong>Gérer la capacité :</strong>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• Si la session est pleine → Les nouveaux participants vont en liste d'attente</li>
                      <li>• Vous pouvez promouvoir depuis la liste d'attente</li>
                    </ul>
                  </div>
                </li>
              </ol>
            </div>

            {/* Timeline globale */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Utiliser la Timeline globale</h3>
              <p className="text-sm mb-3">
                <strong>Navigation :</strong> Dashboard Planif. → Timeline
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-2">Fonctionnalités :</p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Vue chronologique</strong> : Toutes les sessions, transports, hébergements par jour</li>
                    <li>
                      • <strong>Filtres disponibles</strong> :
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>- Par participant : Voir le planning d'un invité spécifique</li>
                        <li>- Par type : Sessions, Arrivées, Départs, Check-in/out, etc.</li>
                        <li>- Par date : Période personnalisée</li>
                      </ul>
                    </li>
                    <li>
                      • <strong>Codes couleur</strong> :
                      <ul className="ml-4 mt-1 space-y-1">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-blue-500"></div>
                          Bleu : Sessions
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-teal-500"></div>
                          Teal : Arrivées transport
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-red-500"></div>
                          Rouge : Départs transport
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-purple-500"></div>
                          Violet : Hébergement
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Détecter les conflits */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Détecter les conflits horaires</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-2">Voir les alertes :</p>
                  <ol className="space-y-1 ml-4">
                    <li>1. Dashboard Planif. → Section "Alertes Critiques"</li>
                    <li>2. Alerte : "X participant(s) inscrit(s) à des sessions qui se chevauchent"</li>
                    <li>3. Cliquer sur l'alerte → Voir les détails</li>
                    <li>4. Voir la liste des conflits avec noms et sessions</li>
                  </ol>
                </div>
                <div>
                  <p className="font-semibold mb-2">Résoudre :</p>
                  <ol className="space-y-1 ml-4">
                    <li>1. Aller à la timeline (lien dans l'alerte)</li>
                    <li>2. Filtrer par participant concerné</li>
                    <li>3. Retirer de l'une des sessions en conflit</li>
                    <li>4. Retour au dashboard → L'alerte disparaît ✅</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Transport */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <Plane className="h-6 w-6 text-teal-500" />
            <h2 className="text-2xl font-bold">✈️ Module TRANSPORT</h2>
          </div>

          <div className="space-y-6">
            {/* Enregistrer un transport */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Enregistrer un transport individuel</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">1.</span>
                  <span><strong>Accéder :</strong> Transport → "Nouveau transport"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">2.</span>
                  <span><strong>Sélectionner l'invité</strong> : Recherche par nom/email</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">3.</span>
                  <div>
                    <strong>Choisir le type :</strong>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• Vol (FLIGHT)</li>
                      <li>• Train (TRAIN)</li>
                      <li>• Navette (SHUTTLE)</li>
                      <li>• Taxi (TAXI)</li>
                      <li>• Location (CAR_RENTAL)</li>
                      <li>• Voiture personnelle (PERSONAL_CAR)</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">4.</span>
                  <div>
                    <strong>Remplir les détails :</strong>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• <strong>Départ</strong> : Ville/Aéroport, Date, Heure</li>
                      <li>• <strong>Arrivée</strong> : Ville/Aéroport, Date, Heure</li>
                      <li>• <strong>Compagnie</strong> : Ex. "Air France"</li>
                      <li>• <strong>Référence</strong> : N° de vol/train</li>
                      <li>• <strong>Siège</strong> : Ex. "12A"</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">5.</span>
                  <span><strong>Définir le statut</strong> : Demandé → En attente → Confirmé → Réservé</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">6.</span>
                  <span><strong>Coût</strong> : Montant et devise</span>
                </li>
              </ol>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-teal-900">
                    <strong>Astuce :</strong> Marquez "Pris en charge par l'entreprise" pour le suivi budget.
                  </p>
                </div>
              </div>
            </div>

            {/* Navette collective */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Créer une navette collective (Manifeste)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Cas d'usage :</strong> Navette aéroport → hôtel pour 15 personnes
              </p>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">1.</span>
                  <span><strong>Accéder :</strong> Transport → Manifestes → "Nouveau manifeste"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">2.</span>
                  <div>
                    <strong>Remplir :</strong>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• <strong>Nom</strong> : "Navette Aéroport CDG → Hôtel Marriott"</li>
                      <li>• <strong>Type</strong> : SHUTTLE</li>
                      <li>• <strong>Départ</strong> : Terminal 2E, 15h00</li>
                      <li>• <strong>Arrivée</strong> : Hôtel Marriott, 16h00</li>
                      <li>• <strong>Capacité</strong> : 20 places</li>
                      <li>• <strong>Coût par personne</strong> : 25€</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">3.</span>
                  <span><strong>Enregistrer</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">4.</span>
                  <div>
                    <strong>Ajouter des participants :</strong>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• Cliquer sur le manifeste</li>
                      <li>• Ajouter les invités un par un</li>
                      <li>• Le compteur se met à jour automatiquement (15/20)</li>
                    </ul>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Hébergement */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <Hotel className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-bold">🏨 Module HÉBERGEMENT</h2>
          </div>

          <div className="space-y-6">
            {/* Ajouter un hébergement */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Ajouter un hébergement</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">1.</span>
                  <span><strong>Accéder :</strong> Hébergement → "Nouvel hébergement"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">2.</span>
                  <div>
                    <strong>Formulaire complet (5 sections) :</strong>
                    <ul className="ml-4 mt-2 space-y-2">
                      <li>
                        • <strong>Informations de base</strong> :
                        <ul className="ml-4 mt-1">
                          <li>- Nom : "Hôtel Marriott Paris"</li>
                          <li>- Type : Hôtel</li>
                          <li>- Étoiles : ⭐⭐⭐⭐</li>
                        </ul>
                      </li>
                      <li>
                        • <strong>Adresse</strong> :
                        <ul className="ml-4 mt-1">
                          <li>- Adresse, Ville, Code postal, Pays</li>
                        </ul>
                      </li>
                      <li>
                        • <strong>Contact</strong> :
                        <ul className="ml-4 mt-1">
                          <li>- Téléphone, Email, Site web</li>
                          <li>- Personne de contact</li>
                        </ul>
                      </li>
                      <li>
                        • <strong>Capacité & Horaires</strong> :
                        <ul className="ml-4 mt-1">
                          <li>- Chambres totales : 100</li>
                          <li>- Chambres allouées pour l'événement : 30</li>
                          <li>- Check-in : 14:00 / Check-out : 11:00</li>
                        </ul>
                      </li>
                      <li>
                        • <strong>Tarification</strong> :
                        <ul className="ml-4 mt-1">
                          <li>- Tarif négocié : 120€ par nuit</li>
                          <li>- Devise : EUR</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">3.</span>
                  <span><strong>Options</strong> : ✅ "Hébergement préféré" pour marquer comme officiel</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">4.</span>
                  <span><strong>Enregistrer</strong></span>
                </li>
              </ol>
            </div>

            {/* Créer les chambres */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Créer les chambres</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">1.</span>
                  <span><strong>Cliquer</strong> sur un hébergement</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">2.</span>
                  <span><strong>Cliquer</strong> : "Ajouter des chambres"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">3.</span>
                  <div>
                    <strong>Pour chaque chambre :</strong>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• N° : "101", "Suite Présidentielle", etc.</li>
                      <li>• Étage : 1</li>
                      <li>• Type : Simple, Double, Twin, Triple, Suite, Studio, Appartement</li>
                      <li>• Capacité max : 2</li>
                      <li>• Configuration lits : "1 lit King"</li>
                      <li>• Vue : "Vue mer"</li>
                      <li>• ♿ Accessible PMR</li>
                      <li>• 🚭 Fumeurs autorisés</li>
                      <li>• Tarif : 150€/nuit</li>
                    </ul>
                  </div>
                </li>
              </ol>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-900">
                    <strong>Astuce bulk :</strong> Créez chambre par chambre. Le système gère automatiquement les statuts.
                  </p>
                </div>
              </div>
            </div>

            {/* Rooming List */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Créer la Rooming List (Assigner les invités)</h3>
              <p className="text-sm mb-3">
                <strong>Vue d'ensemble :</strong> Hébergement → Cliquer sur un hôtel → Rooming List complète
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-2">Assigner un invité :</p>
                  <ol className="space-y-2 ml-4">
                    <li className="flex gap-2">
                      <span className="font-semibold min-w-[20px]">1.</span>
                      <span><strong>Sur une chambre disponible</strong> : Cliquer "Assigner"</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold min-w-[20px]">2.</span>
                      <div>
                        <strong>Dialog d'assignation :</strong>
                        <ul className="ml-4 mt-2 space-y-1">
                          <li>• Rechercher l'invité : Taper nom/email → Sélectionner</li>
                          <li>• Dates : Check-in + Check-out</li>
                          <li>• Le système calcule le nombre de nuits</li>
                          <li>• Chambre partagée : Marquer l'invité principal</li>
                          <li>• Demandes spéciales : "Lit bébé", "Étage élevé", etc.</li>
                        </ul>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold min-w-[20px]">3.</span>
                      <span><strong>Enregistrer</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold min-w-[20px]">4.</span>
                      <span>La chambre passe en statut "Assignée" ✅</span>
                    </li>
                  </ol>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold mb-2">Validations automatiques :</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">❌</span>
                      <span>Impossible d'assigner si capacité atteinte</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">❌</span>
                      <span>Date départ doit être après date arrivée</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✅</span>
                      <span>Le statut se met à jour automatiquement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <Activity className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold">📊 Dashboard Planification</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Vue d'ensemble</h3>
              <p className="text-sm mb-3">
                <strong>Accès :</strong> Dashboard Planif. (icône Activity dans sidebar)
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-2">Stats globales :</p>
                  <ul className="ml-4 space-y-1">
                    <li>• Invités (total / confirmés)</li>
                    <li>• Sessions (total / publiées)</li>
                    <li>• Transports (total / confirmés)</li>
                    <li>• Hébergements (chambres totales / assignées / invités logés)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Alertes automatiques (8 types) :</p>
                  <ul className="ml-4 space-y-2">
                    <li className="flex items-start gap-2">
                      <Badge className="bg-red-100 text-red-700 border-red-300 mt-0.5">Critique</Badge>
                      <span>Conflits horaires</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-orange-100 text-orange-700 border-orange-300 mt-0.5">Moyen</Badge>
                      <span>Invités sans transport, sans hébergement, transports non confirmés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge className="bg-green-100 text-green-700 border-green-300 mt-0.5">Info</Badge>
                      <span>Sessions sans participants, sessions pleines, sessions à venir &lt;24h, invités sans sessions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Utiliser les alertes</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-2">Workflow :</p>
                  <ol className="ml-4 space-y-1">
                    <li>1. Dashboard affiche l'alerte avec compteur</li>
                    <li>2. Cliquer sur l'alerte</li>
                    <li>3. Voir les détails (liste invités, sessions, etc.)</li>
                    <li>4. Action directe via bouton (lien vers page appropriée)</li>
                    <li>5. Résoudre le problème</li>
                    <li>6. L'alerte disparaît automatiquement ✅</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exports */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-6">
            <Download className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold">📤 Exports</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Export Manifeste Excel complet</h3>
              <p className="text-sm mb-3">
                <strong>Accès :</strong> Dashboard ou Timeline → Bouton "Manifeste Excel"
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-2">Contenu du fichier (6 feuilles) :</p>
                  <ol className="ml-4 space-y-1">
                    <li>1. <strong>Vue d'ensemble</strong> : Stats événement</li>
                    <li>2. <strong>Invités</strong> : Liste complète avec RSVP, sessions, transports</li>
                    <li>3. <strong>Sessions</strong> : Détails + participants</li>
                    <li>4. <strong>Transports</strong> : Tous les transports avec invités</li>
                    <li>5. <strong>Matrice Sessions</strong> : Tableau invités × sessions (✓ = inscrit)</li>
                    <li>6. <strong>Timeline</strong> : Chronologie complète</li>
                  </ol>
                </div>
                <p className="text-muted-foreground">
                  <strong>Usage :</strong> Partagez avec l'équipe, imprimez, analysez dans Excel.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Export Timeline PDF</h3>
              <p className="text-sm mb-3">
                <strong>Accès :</strong> Dashboard ou Timeline → Bouton "Timeline PDF"
              </p>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• Timeline visuelle formatée</li>
                <li>• Organisée par jour</li>
                <li>• Codes couleur professionnels</li>
                <li>• Horaires clairs</li>
                <li>• Prêt à imprimer/distribuer</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Usage :</strong> Affichage sur site, distribution participants, brief équipe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3">Export Programme Participant individuel</h3>
              <p className="text-sm mb-3">
                <strong>Accès :</strong> Page Invités → Icône téléchargement sur chaque invité
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-2">Contenu personnalisé :</p>
                  <ul className="ml-4 space-y-1">
                    <li>• Informations invité</li>
                    <li>• Statut RSVP</li>
                    <li>• Tous les transports avec détails</li>
                    <li>• Hébergement (chambre, dates)</li>
                    <li>• Sessions inscrites organisées par jour</li>
                    <li>• Infos complémentaires (repas, allergies)</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  <strong>Usage :</strong> Envoyez à chaque participant son planning personnalisé.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-6">❓ FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Comment activer un module ?',
                a: 'Vue d\'ensemble événement → Modules disponibles → Activer',
              },
              {
                q: 'Puis-je désactiver un module ?',
                a: 'Oui, mais les données restent. Réactivez pour les retrouver.',
              },
              {
                q: 'Les alertes sont-elles automatiques ?',
                a: 'Oui, le système détecte en temps réel.',
              },
              {
                q: 'Puis-je exporter sans modules activés ?',
                a: 'Oui, mais l\'export contiendra uniquement les données disponibles.',
              },
              {
                q: 'Comment gérer plusieurs hôtels ?',
                a: 'Créez plusieurs hébergements. La rooming list est par hébergement.',
              },
              {
                q: 'Les participants peuvent-ils voir leur planning ?',
                a: 'Exportez leur fiche individuelle en PDF et envoyez-la.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                <p className="font-semibold text-sm mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">🆘 Besoin d'aide ?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Consultez les tooltips (🛈) dans chaque page pour des informations contextuelles.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/modules-showcase">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Showcase modules
                  </Button>
                </Link>
                <Link href="https://github.com/Weevup/invitation/blob/main/docs/USER_STORIES.md" target="_blank">
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    User Stories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
