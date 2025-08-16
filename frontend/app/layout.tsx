import type React from "react"
import type { Metadata } from "next"
import { Bricolage_Grotesque, DynaPuff } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
})

const dynaPuff = DynaPuff({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dynapuff",
})

export const metadata: Metadata = {
  title: "Glimps - Track Your Transformation Journey",
  description: "Capture your transformation with professional photo tracking, analytics, and beautiful timelapses",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bricolageGrotesque.variable} ${dynaPuff.variable} antialiased`}>
      <body>
        <Navbar />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
