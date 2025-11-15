// Icônes par type de session
export const SESSION_ICONS: Record<string, string> = {
  KEYNOTE: '🎤',
  WORKSHOP: '🛠️',
  CONFERENCE: '📊',
  TEAMBUILDING: '🤝',
  MEAL: '🍽️',
  BREAK: '☕',
  TRANSFER: '🚌',
  ARRIVAL: '🛬',
  DEPARTURE: '🛫',
  FREE_TIME: '🏖️',
  NETWORKING: '🤝',
  TRAINING: '📚',
  PANEL: '💬',
  OTHER: '📌'
}

// Couleurs par type de session
export const SESSION_COLORS: Record<string, string> = {
  KEYNOTE: '#9333EA',
  WORKSHOP: '#059669',
  CONFERENCE: '#0284C7',
  TEAMBUILDING: '#DC2626',
  MEAL: '#F59E0B',
  BREAK: '#8B5CF6',
  TRANSFER: '#6366F1',
  ARRIVAL: '#10B981',
  DEPARTURE: '#EF4444',
  FREE_TIME: '#14B8A6',
  NETWORKING: '#F97316',
  TRAINING: '#3B82F6',
  PANEL: '#EC4899',
  OTHER: '#6B7280'
}

// Labels pour les types de session
export const SESSION_TYPE_LABELS: Record<string, string> = {
  KEYNOTE: 'Keynote',
  WORKSHOP: 'Atelier',
  CONFERENCE: 'Conférence',
  TEAMBUILDING: 'Team Building',
  MEAL: 'Repas',
  BREAK: 'Pause',
  TRANSFER: 'Transfert',
  ARRIVAL: 'Arrivée',
  DEPARTURE: 'Départ',
  FREE_TIME: 'Temps libre',
  NETWORKING: 'Networking',
  TRAINING: 'Formation',
  PANEL: 'Table ronde',
  OTHER: 'Autre'
}

// Helper functions pour le formatage
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

export const formatLongDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
