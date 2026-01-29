import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Providers from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PymePulse",
  description: "Sistema simple de gestión para pymes",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${fraunces.variable} antialiased`}>
        <Providers>
          {session ? <Navbar /> : null}
          <div className="app-shell">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
