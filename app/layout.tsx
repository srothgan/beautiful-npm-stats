import type { Metadata } from "next"
import { Outfit, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NuqsProvider } from "@/components/nuqs-provider"
import { Header } from "@/components/header"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Link from "next/link"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Beautiful npm Stats - Package Download Analytics",
    template: "%s | Beautiful npm Stats",
  },
  description:
    "Beautiful npm package statistics. Compare downloads, track trends, and share insights with stunning visualizations.",
  keywords: [
    "npm",
    "package",
    "statistics",
    "downloads",
    "analytics",
    "javascript",
    "node.js",
    "typescript",
    "bundle size",
    "dependencies",
  ],
  authors: [{ name: "Beautiful npm Stats" }],
  metadataBase: new URL("https://beautiful-npm-stats.com"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: { url: "/logo-dark.svg", type: "image/svg+xml" },
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://beautiful-npm-stats.com",
    siteName: "Beautiful npm Stats",
    title: "Beautiful npm Stats - Package Download Analytics",
    description:
      "Beautiful npm package statistics. Compare downloads, track trends, and share insights.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Beautiful npm Stats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beautiful npm Stats",
    description:
      "Beautiful npm package statistics. Compare downloads, track trends, and share insights.",
    images: ["/twitter-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsProvider>
            <div className="relative min-h-screen flex flex-col">
              {/* Atmospheric background */}
              <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="grid-bg absolute inset-0" />
                <div className="glow-spot -top-75 -left-50" />
                <div className="glow-spot -bottom-75 -right-50 opacity-50" />
                <div className="noise absolute inset-0" />
              </div>

              <Header />
              <main className="flex-1">{children}</main>

              <footer className="border-t border-border/50 py-8 mt-auto">
                <div className="container mx-auto max-w-6xl px-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground font-mono">
                      <span className="text-primary">$</span> data via{" "}
                      <Link
                        href="https://www.npmjs.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        npmjs.com
                      </Link>
                    </p>
                    <Link
                      href="https://github.com/srothgan/beautiful-npm-stats"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      GitHub
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </NuqsProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
