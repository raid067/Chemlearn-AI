import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RootProviders from "@/components/layout/RootProviders";

export const metadata: Metadata = {
  title: "ChemLearn AI",
  description: "Gamified SPM Chemistry with AI",
  applicationName: "ChemLearn",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "ChemLearn",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <RootProviders>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </RootProviders>
      </body>
    </html>
  );
}
