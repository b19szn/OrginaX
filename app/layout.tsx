import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "OriginaX AI | Multi-Modal Plagiarism Detector",
  description:
    "Next-generation AI multi-modal similarity analysis framework detecting plagiarism beyond text across source code ASTs, PDFs, and visual graphics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col multimodal-canvas text-slate-700 antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

