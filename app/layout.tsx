import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RachaRank",
  description: "Compite en grupo para dejar de fumar con ranking y rangos."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
