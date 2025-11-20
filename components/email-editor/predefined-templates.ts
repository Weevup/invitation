import { EmailTemplate } from './block-types'

export const PREDEFINED_TEMPLATES: Record<string, EmailTemplate> = {
  'invitation-classic': {
    id: 'invitation-classic',
    name: 'Invitation Classique',
    globalStyles: {
      fontFamily: 'Arial',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      backgroundColor: '#F5F5F5',
      containerWidth: 600,
    },
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        order: 0,
        content: {
          title: 'Vous êtes invité(e)',
          subtitle: 'à notre événement exceptionnel',
          backgroundColor: '#004645',
          textColor: '#FFFFFF',
          align: 'center',
        },
      },
      {
        id: 'spacer-1',
        type: 'spacer',
        order: 1,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-1',
        type: 'text',
        order: 2,
        content: {
          html: '<p>Cher(e) <strong>{{guestName}}</strong>,</p><p>Nous avons le plaisir de vous inviter à notre événement qui se tiendra le <strong>{{eventDate}}</strong>.</p><p>Ce sera l\'occasion de célébrer ensemble et de partager un moment convivial.</p>',
          fontSize: 'medium',
          align: 'left',
          color: '#333333',
          padding: 'medium',
        },
      },
      {
        id: 'infobox-1',
        type: 'infoBox',
        order: 3,
        content: {
          icon: '📅',
          title: 'Date et heure',
          description: '{{eventDate}} à {{eventTime}}',
          backgroundColor: '#F0F9FF',
          borderColor: '#009197',
        },
      },
      {
        id: 'infobox-2',
        type: 'infoBox',
        order: 4,
        content: {
          icon: '📍',
          title: 'Lieu',
          description: '{{eventLocation}}, {{eventAddress}}',
          backgroundColor: '#F0F9FF',
          borderColor: '#009197',
        },
      },
      {
        id: 'spacer-2',
        type: 'spacer',
        order: 5,
        content: {
          height: 'medium',
        },
      },
      {
        id: 'button-1',
        type: 'button',
        order: 6,
        content: {
          text: 'Confirmer ma présence',
          url: '{{rsvpUrl}}',
          backgroundColor: '#FF4713',
          textColor: '#FFFFFF',
          align: 'center',
          size: 'large',
          borderRadius: 'pill',
        },
      },
      {
        id: 'spacer-3',
        type: 'spacer',
        order: 7,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-2',
        type: 'text',
        order: 8,
        content: {
          html: '<p style="text-align: center; color: #666; font-size: 14px;">Nous espérons vous compter parmi nous.<br/>À très bientôt !</p>',
          fontSize: 'small',
          align: 'center',
          color: '#666666',
          padding: 'medium',
        },
      },
    ],
  },

  'save-the-date': {
    id: 'save-the-date',
    name: 'Save the Date',
    globalStyles: {
      fontFamily: 'Arial',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      backgroundColor: '#F5F5F5',
      containerWidth: 600,
    },
    blocks: [
      {
        id: 'spacer-1',
        type: 'spacer',
        order: 0,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-1',
        type: 'text',
        order: 1,
        content: {
          html: '<p style="text-align: center; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #FF4713;">Save the Date</p>',
          fontSize: 'medium',
          align: 'center',
          color: '#FF4713',
          padding: 'small',
        },
      },
      {
        id: 'text-2',
        type: 'text',
        order: 2,
        content: {
          html: '<h1 style="text-align: center; font-size: 42px; font-weight: bold; color: #004645; margin: 20px 0;">{{eventName}}</h1>',
          fontSize: 'large',
          align: 'center',
          color: '#004645',
          padding: 'none',
        },
      },
      {
        id: 'spacer-2',
        type: 'spacer',
        order: 3,
        content: {
          height: 'medium',
        },
      },
      {
        id: 'text-3',
        type: 'text',
        order: 4,
        content: {
          html: '<p style="text-align: center; font-size: 20px; color: #333;">📅 {{dateAnnouncement}}</p><p style="text-align: center; font-size: 20px; color: #333;">📍 {{locationHint}}</p>',
          fontSize: 'large',
          align: 'center',
          color: '#333333',
          padding: 'medium',
        },
      },
      {
        id: 'divider-1',
        type: 'divider',
        order: 5,
        content: {
          color: '#009197',
          thickness: 'thin',
          style: 'solid',
        },
      },
      {
        id: 'text-4',
        type: 'text',
        order: 6,
        content: {
          html: '<p>Bonjour <strong>{{guestName}}</strong>,</p><p>{{teaserMessage}}</p><p>Plus de détails suivront prochainement.</p>',
          fontSize: 'medium',
          align: 'left',
          color: '#333333',
          padding: 'large',
        },
      },
      {
        id: 'spacer-3',
        type: 'spacer',
        order: 7,
        content: {
          height: 'large',
        },
      },
    ],
  },

  'reminder': {
    id: 'reminder',
    name: 'Rappel',
    globalStyles: {
      fontFamily: 'Arial',
      primaryColor: '#FF4713',
      secondaryColor: '#009197',
      backgroundColor: '#F5F5F5',
      containerWidth: 600,
    },
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        order: 0,
        content: {
          title: '⏰ Rappel',
          subtitle: 'L\'événement approche !',
          backgroundColor: '#FF4713',
          textColor: '#FFFFFF',
          align: 'center',
        },
      },
      {
        id: 'spacer-1',
        type: 'spacer',
        order: 1,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-1',
        type: 'text',
        order: 2,
        content: {
          html: '<p>Bonjour <strong>{{guestName}}</strong>,</p><p>C\'est bientôt ! Nous vous rappelons que <strong>{{eventName}}</strong> aura lieu dans quelques jours.</p>',
          fontSize: 'medium',
          align: 'left',
          color: '#333333',
          padding: 'medium',
        },
      },
      {
        id: 'infobox-1',
        type: 'infoBox',
        order: 3,
        content: {
          icon: '⚠️',
          title: 'Informations importantes',
          description: 'Date : {{eventDate}} à {{eventTime}}\nLieu : {{eventLocation}}',
          backgroundColor: '#FFF3E0',
          borderColor: '#FF4713',
        },
      },
      {
        id: 'spacer-2',
        type: 'spacer',
        order: 4,
        content: {
          height: 'medium',
        },
      },
      {
        id: 'text-2',
        type: 'text',
        order: 5,
        content: {
          html: '<p>N\'oubliez pas de confirmer votre présence si ce n\'est pas déjà fait.</p>',
          fontSize: 'medium',
          align: 'left',
          color: '#333333',
          padding: 'medium',
        },
      },
      {
        id: 'button-1',
        type: 'button',
        order: 6,
        content: {
          text: 'Confirmer ma présence',
          url: '{{rsvpUrl}}',
          backgroundColor: '#FF4713',
          textColor: '#FFFFFF',
          align: 'center',
          size: 'medium',
          borderRadius: 'rounded',
        },
      },
      {
        id: 'spacer-3',
        type: 'spacer',
        order: 7,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-3',
        type: 'text',
        order: 8,
        content: {
          html: '<p style="text-align: center; color: #666;">À très bientôt !</p>',
          fontSize: 'small',
          align: 'center',
          color: '#666666',
          padding: 'medium',
        },
      },
    ],
  },

  'modern-image': {
    id: 'modern-image',
    name: 'Moderne avec Image',
    globalStyles: {
      fontFamily: 'Arial',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      backgroundColor: '#F5F5F5',
      containerWidth: 600,
    },
    blocks: [
      {
        id: 'image-1',
        type: 'image',
        order: 0,
        content: {
          url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
          alt: 'Event banner',
          align: 'center',
          width: 'full',
        },
      },
      {
        id: 'spacer-1',
        type: 'spacer',
        order: 1,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-1',
        type: 'text',
        order: 2,
        content: {
          html: '<h1 style="font-size: 32px; font-weight: bold; color: #004645; margin: 0;">{{eventName}}</h1>',
          fontSize: 'large',
          align: 'center',
          color: '#004645',
          padding: 'medium',
        },
      },
      {
        id: 'text-2',
        type: 'text',
        order: 3,
        content: {
          html: '<p style="font-size: 18px; color: #666;">{{eventDescription}}</p>',
          fontSize: 'medium',
          align: 'center',
          color: '#666666',
          padding: 'medium',
        },
      },
      {
        id: 'spacer-2',
        type: 'spacer',
        order: 4,
        content: {
          height: 'medium',
        },
      },
      {
        id: 'twocolumn-1',
        type: 'twoColumn',
        order: 5,
        content: {
          leftColumn: '<p style="text-align: center;"><strong style="color: #004645;">Date</strong><br/>{{eventDate}}</p>',
          rightColumn: '<p style="text-align: center;"><strong style="color: #004645;">Lieu</strong><br/>{{eventLocation}}</p>',
          leftWidth: 50,
          rightWidth: 50,
          gap: 'medium',
        },
      },
      {
        id: 'spacer-3',
        type: 'spacer',
        order: 6,
        content: {
          height: 'large',
        },
      },
      {
        id: 'button-1',
        type: 'button',
        order: 7,
        content: {
          text: 'En savoir plus',
          url: '{{eventUrl}}',
          backgroundColor: '#009197',
          textColor: '#FFFFFF',
          align: 'center',
          size: 'large',
          borderRadius: 'rounded',
        },
      },
      {
        id: 'spacer-4',
        type: 'spacer',
        order: 8,
        content: {
          height: 'xlarge',
        },
      },
    ],
  },

  'confirmation-accepted': {
    id: 'confirmation-accepted',
    name: 'Confirmation de présence',
    globalStyles: {
      fontFamily: 'Arial',
      primaryColor: '#48bb78',
      secondaryColor: '#38a169',
      backgroundColor: '#F5F5F5',
      containerWidth: 600,
    },
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        order: 0,
        content: {
          title: '✓ Confirmation enregistrée',
          subtitle: 'Merci pour votre réponse !',
          backgroundColor: '#48bb78',
          textColor: '#FFFFFF',
          align: 'center',
        },
      },
      {
        id: 'spacer-1',
        type: 'spacer',
        order: 1,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-1',
        type: 'text',
        order: 2,
        content: {
          html: '<p>Bonjour <strong>{{guest.firstName}}</strong>,</p><p>Merci d\'avoir confirmé votre présence à notre événement ! Nous sommes ravis de vous compter parmi nous.</p>',
          fontSize: 'medium',
          align: 'left',
          color: '#333333',
          padding: 'medium',
        },
      },
      {
        id: 'infobox-1',
        type: 'infoBox',
        order: 3,
        content: {
          icon: '📅',
          title: '{{event.name}}',
          description: 'Date : {{event.date}}\nLieu : {{event.location}}',
          backgroundColor: '#f0fff4',
          borderColor: '#48bb78',
        },
      },
      {
        id: 'spacer-2',
        type: 'spacer',
        order: 4,
        content: {
          height: 'medium',
        },
      },
      {
        id: 'infobox-2',
        type: 'infoBox',
        order: 5,
        content: {
          icon: '📱',
          title: 'Votre QR code d\'accès',
          description: 'Un QR code a été généré et est disponible sur la page de confirmation. Vous pourrez le présenter à l\'entrée de l\'événement.',
          backgroundColor: '#edf2f7',
          borderColor: '#48bb78',
        },
      },
      {
        id: 'spacer-3',
        type: 'spacer',
        order: 6,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-2',
        type: 'text',
        order: 7,
        content: {
          html: '<p style="color: #718096; font-size: 14px;">Vous pouvez modifier votre réponse à tout moment en utilisant le lien de votre invitation initiale.</p>',
          fontSize: 'small',
          align: 'center',
          color: '#718096',
          padding: 'medium',
        },
      },
    ],
  },

  'confirmation-declined': {
    id: 'confirmation-declined',
    name: 'Réponse négative enregistrée',
    globalStyles: {
      fontFamily: 'Arial',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      backgroundColor: '#F5F5F5',
      containerWidth: 600,
    },
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        order: 0,
        content: {
          title: 'Réponse enregistrée',
          subtitle: 'Nous espérons vous voir prochainement',
          backgroundColor: '#667eea',
          textColor: '#FFFFFF',
          align: 'center',
        },
      },
      {
        id: 'spacer-1',
        type: 'spacer',
        order: 1,
        content: {
          height: 'large',
        },
      },
      {
        id: 'text-1',
        type: 'text',
        order: 2,
        content: {
          html: '<p>Bonjour <strong>{{guest.firstName}}</strong>,</p><p>Nous avons bien enregistré votre réponse concernant <strong>{{event.name}}</strong>.</p><p>Nous sommes désolés que vous ne puissiez pas être parmi nous cette fois-ci, mais nous espérons vous voir lors d\'un prochain événement !</p>',
          fontSize: 'medium',
          align: 'left',
          color: '#333333',
          padding: 'medium',
        },
      },
      {
        id: 'spacer-2',
        type: 'spacer',
        order: 3,
        content: {
          height: 'medium',
        },
      },
      {
        id: 'text-2',
        type: 'text',
        order: 4,
        content: {
          html: '<p style="color: #718096; font-size: 14px;">Vous pouvez modifier votre réponse à tout moment en utilisant le lien de votre invitation initiale.</p>',
          fontSize: 'small',
          align: 'center',
          color: '#718096',
          padding: 'medium',
        },
      },
      {
        id: 'spacer-3',
        type: 'spacer',
        order: 5,
        content: {
          height: 'large',
        },
      },
    ],
  },

  'blank': {
    id: 'blank',
    name: 'Vide (Partir de zéro)',
    globalStyles: {
      fontFamily: 'Arial',
      primaryColor: '#004645',
      secondaryColor: '#009197',
      backgroundColor: '#F5F5F5',
      containerWidth: 600,
    },
    blocks: [],
  },
}
