"use client";

import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function TestCommunicationsPage() {
  const { toast } = useToast();

  const handleTest = () => {
    toast({
      title: "Test",
      description: "Si tu vois ce message, le toast fonctionne!",
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page Communications</h1>
      <Button onClick={handleTest}>
        Test Toast
      </Button>
      <div className="mt-4 text-sm text-gray-600">
        Cette page teste uniquement le système de toast.
      </div>
    </div>
  );
}
