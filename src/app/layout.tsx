import type { Metadata } from "next";
import { Montserrat, Lato } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://purabombilla.com"),
  title: {
    default: "purabombilla | Mates y Accesorios Premium",
    template: "%s | purabombilla",
  },
  description: "Tienda online de mates, bombillas y accesorios de diseño en Argentina. Calidad premium y envíos a todo el país.",
  keywords: ["mate", "bombilla", "yerba", "argentina", "diseño", "premium", "accesorios", "regalos"],
  authors: [{ name: "purabombilla" }],
  creator: "purabombilla",
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    title: "purabombilla | Mates y Accesorios Premium",
    description: "Tienda online de mates, bombillas y accesorios de diseño en Argentina.",
    siteName: "purabombilla",
  },
  twitter: {
    card: "summary_large_image",
    title: "purabombilla | Mates y Accesorios Premium",
    description: "Tienda online de mates, bombillas y accesorios de diseño en Argentina.",
    creator: "@purabombilla",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${lato.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
