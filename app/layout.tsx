import type { Metadata } from "next";
import { Lato, Abril_Fatface } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato"
});

const abrilFatface = Abril_Fatface({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-abril"
});

export const metadata: Metadata = {
  title: "Invitation Manager - Gérez vos invitations en toute simplicité",
  description: "Solution professionnelle de gestion d'invitations pour vos événements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${lato.variable} ${abrilFatface.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
