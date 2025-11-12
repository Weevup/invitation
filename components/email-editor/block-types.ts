// Types pour l'éditeur d'emails WYSIWYG

export type EmailBlockType =
  | 'header'
  | 'text'
  | 'button'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'twoColumn'
  | 'infoBox'

export interface BaseEmailBlock {
  id: string
  type: EmailBlockType
  order: number
}

export interface HeaderBlock extends BaseEmailBlock {
  type: 'header'
  content: {
    title: string
    subtitle?: string
    backgroundColor: string
    textColor: string
    backgroundImage?: string
    align: 'left' | 'center' | 'right'
    logoUrl?: string
  }
}

export interface TextBlock extends BaseEmailBlock {
  type: 'text'
  content: {
    html: string
    fontSize: 'small' | 'medium' | 'large'
    align: 'left' | 'center' | 'right'
    color: string
    padding: 'none' | 'small' | 'medium' | 'large'
  }
}

export interface ButtonBlock extends BaseEmailBlock {
  type: 'button'
  content: {
    text: string
    url: string
    backgroundColor: string
    textColor: string
    align: 'left' | 'center' | 'right'
    size: 'small' | 'medium' | 'large'
    borderRadius: 'square' | 'rounded' | 'pill'
  }
}

export interface ImageBlock extends BaseEmailBlock {
  type: 'image'
  content: {
    url: string
    alt: string
    align: 'left' | 'center' | 'right'
    width: 'full' | 'medium' | 'small'
    link?: string
  }
}

export interface DividerBlock extends BaseEmailBlock {
  type: 'divider'
  content: {
    color: string
    thickness: 'thin' | 'medium' | 'thick'
    style: 'solid' | 'dashed' | 'dotted'
  }
}

export interface SpacerBlock extends BaseEmailBlock {
  type: 'spacer'
  content: {
    height: 'small' | 'medium' | 'large' | 'xlarge'
  }
}

export interface TwoColumnBlock extends BaseEmailBlock {
  type: 'twoColumn'
  content: {
    leftColumn: string
    rightColumn: string
    leftWidth: 50 | 33 | 66
    rightWidth: 50 | 67 | 34
    gap: 'small' | 'medium' | 'large'
  }
}

export interface InfoBoxBlock extends BaseEmailBlock {
  type: 'infoBox'
  content: {
    icon: string
    title: string
    description: string
    backgroundColor: string
    borderColor: string
  }
}

export type EmailBlock =
  | HeaderBlock
  | TextBlock
  | ButtonBlock
  | ImageBlock
  | DividerBlock
  | SpacerBlock
  | TwoColumnBlock
  | InfoBoxBlock

export interface EmailTemplate {
  id: string
  name: string
  blocks: EmailBlock[]
  globalStyles: {
    fontFamily: string
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    containerWidth: number
  }
}

// Default block configurations
export const DEFAULT_BLOCKS: Record<EmailBlockType, Omit<EmailBlock, 'id' | 'order'>> = {
  header: {
    type: 'header',
    content: {
      title: 'Titre de l\'email',
      subtitle: 'Sous-titre',
      backgroundColor: '#004645',
      textColor: '#FFFFFF',
      align: 'center',
    },
  },
  text: {
    type: 'text',
    content: {
      html: '<p>Votre texte ici...</p>',
      fontSize: 'medium',
      align: 'left',
      color: '#333333',
      padding: 'medium',
    },
  },
  button: {
    type: 'button',
    content: {
      text: 'Cliquez ici',
      url: 'https://example.com',
      backgroundColor: '#009197',
      textColor: '#FFFFFF',
      align: 'center',
      size: 'medium',
      borderRadius: 'rounded',
    },
  },
  image: {
    type: 'image',
    content: {
      url: 'https://via.placeholder.com/600x300',
      alt: 'Image',
      align: 'center',
      width: 'full',
    },
  },
  divider: {
    type: 'divider',
    content: {
      color: '#CCCCCC',
      thickness: 'thin',
      style: 'solid',
    },
  },
  spacer: {
    type: 'spacer',
    content: {
      height: 'medium',
    },
  },
  twoColumn: {
    type: 'twoColumn',
    content: {
      leftColumn: '<p>Colonne gauche</p>',
      rightColumn: '<p>Colonne droite</p>',
      leftWidth: 50,
      rightWidth: 50,
      gap: 'medium',
    },
  },
  infoBox: {
    type: 'infoBox',
    content: {
      icon: '📅',
      title: 'Information',
      description: 'Description de l\'information',
      backgroundColor: '#F0F9FF',
      borderColor: '#009197',
    },
  },
}

// Helper function to generate HTML from blocks
export function blocksToHTML(template: EmailTemplate): string {
  const { blocks, globalStyles } = template

  const htmlBlocks = blocks
    .sort((a, b) => a.order - b.order)
    .map(block => blockToHTML(block, globalStyles))
    .join('\n')

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: ${globalStyles.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: ${globalStyles.backgroundColor};
    }
    .email-container {
      max-width: ${globalStyles.containerWidth}px;
      margin: 0 auto;
      background-color: #FFFFFF;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${htmlBlocks}
  </div>
</body>
</html>
  `.trim()
}

function blockToHTML(block: EmailBlock, globalStyles: EmailTemplate['globalStyles']): string {
  switch (block.type) {
    case 'header':
      return renderHeaderBlock(block, globalStyles)
    case 'text':
      return renderTextBlock(block)
    case 'button':
      return renderButtonBlock(block)
    case 'image':
      return renderImageBlock(block)
    case 'divider':
      return renderDividerBlock(block)
    case 'spacer':
      return renderSpacerBlock(block)
    case 'twoColumn':
      return renderTwoColumnBlock(block)
    case 'infoBox':
      return renderInfoBoxBlock(block)
    default:
      return ''
  }
}

function renderHeaderBlock(block: HeaderBlock, globalStyles: EmailTemplate['globalStyles']): string {
  const { content } = block
  const bgStyle = content.backgroundImage
    ? `background-image: url(${content.backgroundImage}); background-size: cover; background-position: center;`
    : `background-color: ${content.backgroundColor};`

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="${bgStyle}">
      <tr>
        <td align="${content.align}" style="padding: 40px 20px;">
          ${content.logoUrl ? `<img src="${content.logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 20px;" />` : ''}
          <h1 style="color: ${content.textColor}; font-size: 36px; font-weight: bold; margin: 0;">${content.title}</h1>
          ${content.subtitle ? `<p style="color: ${content.textColor}; font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">${content.subtitle}</p>` : ''}
        </td>
      </tr>
    </table>
  `
}

function renderTextBlock(block: TextBlock): string {
  const { content } = block
  const paddingMap = { none: '0', small: '10px 20px', medium: '20px', large: '40px 20px' }
  const fontSizeMap = { small: '14px', medium: '16px', large: '18px' }

  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="${content.align}" style="padding: ${paddingMap[content.padding]}; font-size: ${fontSizeMap[content.fontSize]}; color: ${content.color};">
          ${content.html}
        </td>
      </tr>
    </table>
  `
}

function renderButtonBlock(block: ButtonBlock): string {
  const { content } = block
  const sizeMap = { small: '12px 24px', medium: '15px 40px', large: '18px 50px' }
  const radiusMap = { square: '0', rounded: '6px', pill: '50px' }
  const fontSizeMap = { small: '14px', medium: '16px', large: '18px' }

  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="${content.align}" style="padding: 20px;">
          <a href="${content.url}" style="display: inline-block; padding: ${sizeMap[content.size]}; background-color: ${content.backgroundColor}; color: ${content.textColor}; text-decoration: none; border-radius: ${radiusMap[content.borderRadius]}; font-weight: bold; font-size: ${fontSizeMap[content.size]};">
            ${content.text}
          </a>
        </td>
      </tr>
    </table>
  `
}

function renderImageBlock(block: ImageBlock): string {
  const { content } = block
  const widthMap = { small: '200px', medium: '400px', full: '100%' }

  const img = `<img src="${content.url}" alt="${content.alt}" style="max-width: ${widthMap[content.width]}; width: 100%; height: auto; display: block;" />`

  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="${content.align}" style="padding: 0;">
          ${content.link ? `<a href="${content.link}">${img}</a>` : img}
        </td>
      </tr>
    </table>
  `
}

function renderDividerBlock(block: DividerBlock): string {
  const { content } = block
  const thicknessMap = { thin: '1px', medium: '2px', thick: '4px' }

  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 20px;">
          <div style="border-top: ${thicknessMap[content.thickness]} ${content.style} ${content.color};"></div>
        </td>
      </tr>
    </table>
  `
}

function renderSpacerBlock(block: SpacerBlock): string {
  const { content } = block
  const heightMap = { small: '10px', medium: '20px', large: '40px', xlarge: '60px' }

  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="height: ${heightMap[content.height]}; line-height: ${heightMap[content.height]};"></td>
      </tr>
    </table>
  `
}

function renderTwoColumnBlock(block: TwoColumnBlock): string {
  const { content } = block
  const gapMap = { small: '10px', medium: '20px', large: '30px' }

  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: ${gapMap[content.gap]};">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="${content.leftWidth}%" valign="top" style="padding-right: ${gapMap[content.gap]};">
                ${content.leftColumn}
              </td>
              <td width="${content.rightWidth}%" valign="top">
                ${content.rightColumn}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

function renderInfoBoxBlock(block: InfoBoxBlock): string {
  const { content } = block

  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${content.backgroundColor}; border-left: 4px solid ${content.borderColor}; padding: 20px; border-radius: 4px;">
            <tr>
              <td>
                <div style="font-size: 24px; margin-bottom: 10px;">${content.icon}</div>
                <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">${content.title}</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">${content.description}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}
