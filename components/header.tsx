"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GitCompare, Info } from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/about", label: "About", icon: Info },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
          <div className="relative w-9 h-9">
            {/* Light mode: show light logo */}
            <Image
              src="/logo.svg"
              alt="npmstats logo"
              width={36}
              height={36}
              className="absolute inset-0 group-hover:scale-105 transition-transform dark:opacity-0"
            />
            {/* Dark mode: show dark logo */}
            <Image
              src="/logo-dark.svg"
              alt="npmstats logo"
              width={36}
              height={36}
              className="absolute inset-0 group-hover:scale-105 transition-transform opacity-0 dark:opacity-100"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground tracking-tight">
              npm<span className="text-primary">stats</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono -mt-1 hidden sm:block">
              package analytics
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}

          <div className="ml-2 pl-2 border-l border-border/50">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
