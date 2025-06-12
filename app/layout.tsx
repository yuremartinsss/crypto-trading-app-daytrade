import type React from "react"
import { orbitron } from "./fonts"
import "./globals.css"

export const metadata = {
  title: "Criptomoeda Trading View",
  description: "Análise inteligente de criptomoedas com IA",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${orbitron.className} antialiased`}>{children}</body>
    </html>
  )
}
