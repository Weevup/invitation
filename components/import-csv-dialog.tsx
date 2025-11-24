"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Upload, CheckCircle, AlertCircle, Download } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

interface ImportCSVDialogProps {
  eventId: string;
  onImportComplete: () => void;
}

interface CSVRow {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  tags?: string;
  // Professional fields
  jobTitle?: string;
  department?: string;
  companySize?: string;
  industry?: string;
  phone?: string; // For SMS (international format)
  phoneNumber?: string; // Landline
  linkedinUrl?: string;
  // Event needs
  dietaryReqs?: string;
  accessibility?: string;
}

export function ImportCSVDialog({ eventId, onImportComplete }: ImportCSVDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [results, setResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);

      // Validate file type
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Le fichier doit être au format CSV');
        setFile(null);
        return;
      }

      // Parse CSV for preview
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as CSVRow[];
          if (data.length === 0) {
            toast.error('Le fichier CSV est vide');
            setFile(null);
            return;
          }
          setPreview(data.slice(0, 5)); // Show first 5 rows
          toast.success(`Fichier chargé : ${data.length} ligne(s) détectée(s)`);
        },
        error: (error) => {
          toast.error(`Erreur de lecture du CSV : ${error.message}`);
          setFile(null);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Aucun fichier sélectionné');
      return;
    }

    setLoading(true);
    setResults(null);
    setProgress(null);

    toast.info(`Démarrage de l'import...`);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as CSVRow[];
        const errors: string[] = [];

        if (data.length === 0) {
          toast.error('Le fichier CSV est vide');
          setLoading(false);
          return;
        }

        toast.info(`${data.length} ligne(s) détectée(s). Import en cours...`);
        setProgress({ current: 0, total: data.length });

        try {
          // Use batch import endpoint
          const response = await fetch(`/api/admin/events/${eventId}/guests/batch-import`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              guests: data.map(row => ({
                firstName: row.firstName?.trim(),
                lastName: row.lastName?.trim() || undefined,
                email: row.email?.trim().toLowerCase(),
                company: row.company?.trim() || undefined,
                tags: row.tags
                  ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
                  : [],
                jobTitle: row.jobTitle?.trim() || undefined,
                department: row.department?.trim() || undefined,
                companySize: row.companySize?.trim() || undefined,
                industry: row.industry?.trim() || undefined,
                phone: row.phone?.trim() || undefined,
                phoneNumber: row.phoneNumber?.trim() || undefined,
                linkedinUrl: row.linkedinUrl?.trim() || undefined,
                dietaryReqs: row.dietaryReqs?.trim() || undefined,
                accessibility: row.accessibility?.trim() || undefined,
              }))
            }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            setResults({
              success: result.results.imported,
              errors: result.results.errors
            });

            if (result.results.imported > 0) {
              toast.success(`✅ ${result.results.imported} invité(s) importé(s) avec succès !`);
              onImportComplete();
            }

            if (result.results.skipped > 0) {
              toast.info(`ℹ️ ${result.results.skipped} invité(s) ignoré(s) (doublons)`);
            }

            if (result.results.errors.length > 0) {
              toast.error(`❌ ${result.results.errors.length} erreur(s) lors de l'import`);
            }
          } else {
            throw new Error(result.error || 'Erreur lors de l\'import batch');
          }
        } catch (error) {
          console.error('Batch import error:', error);
          toast.error(
            error instanceof Error ? error.message : 'Erreur lors de l\'import'
          );
          setResults({ success: 0, errors: [error instanceof Error ? error.message : 'Erreur inconnue'] });
        } finally {
          setLoading(false);
          setProgress(null);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast.error(`Erreur de lecture du CSV : ${error.message}`);
        setLoading(false);
        setProgress(null);
      }
    });
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setPreview([]);
    setResults(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setOpen(true);
    } else {
      handleClose();
    }
  };

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,company,phone,phoneNumber,jobTitle,department,companySize,industry,linkedinUrl,tags,dietaryReqs,accessibility
Sophie,Martin,sophie.martin@example.com,Tech Solutions,+33612345678,,CEO,Direction,GE,Technologie,https://linkedin.com/in/sophiemartin,"VIP,Sponsor",Végétarien,
Jean,,jean.dupont@example.com,Digital Agency,+33687654321,0145678901,CTO,Technique,PME,Digital,,Presse,Sans gluten,
Marie,Bernard,marie.bernard@example.com,StartupCo,+33698765432,,Product Manager,Produit,TPE,SaaS,,"Innovation,Tech",,Accès PMR`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template-import-invites.csv';
    link.click();
    toast.success('Template CSV téléchargé');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Importer CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Importer des invités depuis un CSV</DialogTitle>
              <DialogDescription>
                Colonnes requises : firstName, email<br/>
                Colonnes optionnelles : lastName, company, jobTitle, phone, phoneNumber, tags, etc.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="ml-4"
            >
              <Download className="h-4 w-4 mr-2" />
              Template CSV
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                {file ? file.name : "Cliquez pour sélectionner un fichier CSV"}
              </p>
              <p className="text-xs text-gray-500">
                ou glissez-déposez votre fichier ici
              </p>
            </label>
          </div>

          {/* Progress Indicator */}
          {progress && loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Import en cours...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#009197] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && !results && !progress && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Aperçu ({preview.length} premières lignes):
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Prénom</th>
                      <th className="px-2 py-1 text-left">Nom</th>
                      <th className="px-2 py-1 text-left">Email</th>
                      <th className="px-2 py-1 text-left">Entreprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1">{row.firstName}</td>
                        <td className="px-2 py-1">{row.lastName}</td>
                        <td className="px-2 py-1">{row.email}</td>
                        <td className="px-2 py-1">{row.company || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-3">
              {/* Success Summary */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">
                    {results.success} invité{results.success > 1 ? 's' : ''} importé{results.success > 1 ? 's' : ''} avec succès
                  </p>
                </div>
              </div>

              {/* Errors Section */}
              {results.errors.length > 0 && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-red-900 text-base">
                          {results.errors.length} erreur{results.errors.length > 1 ? 's' : ''} détectée{results.errors.length > 1 ? 's' : ''}
                        </p>
                        {results.errors.length > 5 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const errorText = results.errors.join('\n')
                              const blob = new Blob([errorText], { type: 'text/plain' })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = 'erreurs-import.txt'
                              a.click()
                              toast.success('Fichier des erreurs téléchargé')
                            }}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Télécharger les erreurs
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-red-700 mb-3">
                        Les invités suivants n'ont pas pu être importés :
                      </p>
                      <div className="bg-white rounded border border-red-200 p-3 max-h-60 overflow-y-auto">
                        <ul className="text-sm text-red-800 space-y-2 font-mono">
                          {results.errors.map((error, idx) => (
                            <li key={idx} className="flex gap-2 items-start">
                              <span className="text-red-500 font-bold flex-shrink-0">•</span>
                              <span className="break-all">{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {results.errors.length > 10 && (
                        <p className="text-xs text-red-600 mt-2 italic">
                          💡 Astuce : Cliquez sur "Télécharger les erreurs" pour obtenir la liste complète
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Example Format */}
          {!file && (
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
              <p className="font-medium mb-1">Exemple de format CSV:</p>
              <code className="block bg-white p-2 rounded border mt-1 text-[10px]">
                firstName,lastName,email,company,phone,jobTitle,tags
                <br />
                Sophie,Martin,sophie@example.com,Tech Solutions,+33612345678,CEO,VIP
                <br />
                Jean,,jean@example.com,Digital Agency,+33687654321,CTO,Presse,Sponsor
              </code>
              <p className="mt-2 text-muted-foreground">
                💡 <strong>lastName</strong> est optionnel - vous pouvez le laisser vide<br/>
                💡 <strong>Phone</strong> doit être au format international (+33...) pour recevoir des SMS
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {results && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResults(null);
                setFile(null);
                setPreview([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Importer un autre fichier
            </Button>
          )}
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            {results ? "Fermer" : "Annuler"}
          </Button>
          {!results && (
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="bg-[#009197] hover:bg-[#004645]"
            >
              {loading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer {preview.length > 0 && `(${preview.length}+ lignes)`}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
