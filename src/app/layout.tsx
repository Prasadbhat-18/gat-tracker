import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "GAT — Student Achievement & Placement Tracking System",
    template: "%s | Global Academy of Technology",
  },
  description:
    "Official institutional administrative system for Global Academy of Technology (GAT), Bengaluru.",
  icons: {
    icon: "/gat-logo.png",
    shortcut: "/gat-logo.png",
    apple: "/gat-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased bg-[#f8f9ff] text-[#0d1c2e] font-sans selection:bg-[#002147] selection:text-white"
      >
        {children}
      </body>
    </html>
  )
}
