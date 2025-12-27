import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SareeViz - AI Virtual Photoshoot",
  description: "Generate virtual photoshoots of models wearing sarees using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
