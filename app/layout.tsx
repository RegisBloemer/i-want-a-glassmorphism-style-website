import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StationLIVE | Gaming News",
  description:
    "Vídeos diários com notícias de games e tecnologia, além de lives ocasionais com a galera.",
  icons: {
    icon: "/station-live-logo.png",
    shortcut: "/station-live-logo.png",
  },
  openGraph: {
    title: "StationLIVE | O jogo muda todo dia",
    description:
      "Notícias de games e tecnologia em vídeos diários — com lives quando a jogatina pedir.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
