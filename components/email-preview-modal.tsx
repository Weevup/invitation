"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Code, Smartphone, Monitor, RefreshCw } from "lucide-react";

interface EmailPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    name: string;
    subject: string;
    htmlContent: string;
  };
  defaultVariables?: Record<string, string>;
}

/**
 * Extract variables from template content
 * Supports: {{variable}}, ${variable}, %variable%
 * Variable names must be alphanumeric with dots, underscores allowed
 */
function extractVariables(content: string): string[] {
  const patterns = [
    /\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g,  // {{variable}} or {{object.property}}
    /\$\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g,    // ${variable}
    /%([a-zA-Z_][a-zA-Z0-9_.]*)%/g,        // %variable%
  ];

  const variables = new Set<string>();

  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      variables.add(match[1].trim());
    }
  });

  return Array.from(variables).sort();
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace variables in content with actual values
 */
function replaceVariables(content: string, values: Record<string, string>): string {
  let result = content;

  Object.entries(values).forEach(([key, value]) => {
    // Escape special regex characters in the key
    const escapedKey = escapeRegex(key);

    // Replace all variable formats
    const patterns = [
      new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g'),  // {{variable}}
      new RegExp(`\\$\\{\\s*${escapedKey}\\s*\\}`, 'g'),      // ${variable}
      new RegExp(`%\\s*${escapedKey}\\s*%`, 'g'),             // %variable%
    ];

    patterns.forEach(pattern => {
      result = result.replace(pattern, value);
    });
  });

  return result;
}

/**
 * Get default sample data for common variables
 */
function getSampleData(variableName: string): string {
  const samples: Record<string, string> = {
    // Guest data (both formats)
    'guestName': 'Sophie Martin',
    'firstName': 'Sophie',
    'lastName': 'Martin',
    'email': 'sophie.martin@example.com',
    'company': 'Weevup',
    'guest.firstName': 'Sophie',
    'guest.lastName': 'Martin',
    'guest.email': 'sophie.martin@example.com',
    'guest.company': 'Weevup',

    // Event data (both formats)
    'eventName': 'Gala Annuel 2025',
    'eventDate': '15 juin 2025',
    'date': '15 juin 2025',
    'time': '19h00',
    'location': 'Le Grand Palais',
    'address': '3 Avenue du Général Eisenhower, 75008 Paris',
    'venueName': 'Le Grand Palais',
    'city': 'Paris',
    'description': 'Rejoignez-nous pour une soirée exceptionnelle',
    'event.name': 'Gala Annuel 2025',
    'event.date': '15 juin 2025',
    'event.time': '19h00',
    'event.location': 'Le Grand Palais',
    'event.address': '3 Avenue du Général Eisenhower, 75008 Paris',
    'event.description': 'Rejoignez-nous pour une soirée exceptionnelle',
    'event.organizerName': 'Weevup Events',

    // Messages
    'welcomeMessage': 'Bienvenue à notre événement',
    'tagline': 'Une soirée inoubliable',
    'teaserMessage': 'Préparez-vous pour une expérience unique',
    'footerMessage': 'Au plaisir de vous accueillir',
    'dateAnnouncement': 'Le 15 juin 2025',
    'locationHint': 'Paris - Détails à venir',

    // Links
    'rsvpLink': 'https://invitation.weevup.com/guest/abc123',
    'ctaLink': 'https://invitation.weevup.com',
    'ctaText': 'Confirmer ma présence',

    // Colors
    'primaryColor': '#004645',
    'secondaryColor': '#009197',
    'accentColor': '#FF4713',
    'backgroundColor': '#FFFFFF',

    // QR Code (actual HTML for preview)
    'qrCode': '<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEMO-QR-CODE" alt="QR Code" style="width: 200px; height: 200px;" />',
    'qrCodeUrl': 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEMO',

    // Other
    'logoUrl': 'https://via.placeholder.com/150x50/004645/FFFFFF?text=LOGO',
    'headerImage': 'https://via.placeholder.com/600x200/009197/FFFFFF?text=EVENT',
  };

  return samples[variableName] || `[${variableName}]`;
}

export function EmailPreviewModal({
  open,
  onOpenChange,
  template,
  defaultVariables = {},
}: EmailPreviewModalProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Extract all variables from template
  const extractedVars = useMemo(() => {
    const subjectVars = extractVariables(template.subject);
    const contentVars = extractVariables(template.htmlContent);
    return Array.from(new Set([...subjectVars, ...contentVars]));
  }, [template]);

  // Initialize variables with defaults or sample data
  useEffect(() => {
    const initialVars: Record<string, string> = {};
    extractedVars.forEach(varName => {
      initialVars[varName] = defaultVariables[varName] || getSampleData(varName);
    });
    setVariables(initialVars);
  }, [extractedVars, defaultVariables]);

  // Generate preview with replaced variables
  const previewSubject = useMemo(
    () => replaceVariables(template.subject, variables),
    [template.subject, variables]
  );

  const previewContent = useMemo(
    () => replaceVariables(template.htmlContent, variables),
    [template.htmlContent, variables]
  );

  const handleVariableChange = (varName: string, value: string) => {
    setVariables(prev => ({ ...prev, [varName]: value }));
  };

  const handleReset = () => {
    const resetVars: Record<string, string> = {};
    extractedVars.forEach(varName => {
      resetVars[varName] = getSampleData(varName);
    });
    setVariables(resetVars);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#009197]" />
            Prévisualisation : {template.name}
          </DialogTitle>
          <DialogDescription>
            Prévisualisez votre email avec des données réelles
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
          {/* Left Panel: Variables Editor */}
          <div className="border rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Variables ({extractedVars.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3 pr-4">
                {extractedVars.map(varName => (
                  <div key={varName} className="space-y-1">
                    <Label htmlFor={varName} className="text-xs font-medium text-[#004645]">
                      {varName}
                    </Label>
                    <Input
                      id={varName}
                      value={variables[varName] || ''}
                      onChange={(e) => handleVariableChange(varName, e.target.value)}
                      placeholder={`Valeur pour ${varName}`}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
                {extractedVars.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Aucune variable détectée
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="col-span-2 border rounded-lg flex flex-col overflow-hidden">
            {/* Preview Controls */}
            <div className="border-b p-3 flex items-center justify-between bg-gray-50">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
                <TabsList className="h-9">
                  <TabsTrigger value="preview" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Aperçu
                  </TabsTrigger>
                  <TabsTrigger value="code" className="text-xs">
                    <Code className="h-3 w-3 mr-1" />
                    Code HTML
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {activeTab === 'preview' && (
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('desktop')}
                    className="h-8"
                  >
                    <Monitor className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('mobile')}
                    className="h-8"
                  >
                    <Smartphone className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Subject Line */}
            <div className="border-b p-3 bg-yellow-50">
              <p className="text-xs text-gray-600 mb-1">Sujet :</p>
              <p className="font-medium text-sm">{previewSubject}</p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              {activeTab === 'preview' ? (
                <div className={`mx-auto bg-white shadow-lg ${viewMode === 'mobile' ? 'max-w-sm' : 'max-w-3xl'}`}>
                  <iframe
                    srcDoc={previewContent}
                    className="w-full h-full min-h-[600px] border-0"
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
                    <code>{previewContent}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
