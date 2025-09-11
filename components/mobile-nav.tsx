"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface MobileNavProps {
  isLoggedIn?: boolean
}

export function MobileNav({ isLoggedIn = false }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-space-grotesk)]">
                NextStep
              </span>
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu
          </SheetDescription>
        </SheetHeader>
        <nav className="mt-6 flex flex-col space-y-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/#features"
                onClick={handleLinkClick}
                className="text-lg hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                onClick={handleLinkClick}
                className="text-lg hover:text-primary transition-colors"
              >
                How it Works
              </Link>
              <div className="pt-4 space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={handleLinkClick}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/quiz" onClick={handleLinkClick}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                onClick={handleLinkClick}
                className={`text-lg hover:text-primary transition-colors ${
                  pathname === "/dashboard" ? "text-primary font-medium" : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/coach"
                onClick={handleLinkClick}
                className={`text-lg hover:text-primary transition-colors ${
                  pathname === "/coach" ? "text-primary font-medium" : ""
                }`}
              >
                AI Coach
              </Link>
              <Link
                href="/careers"
                onClick={handleLinkClick}
                className={`text-lg hover:text-primary transition-colors ${
                  pathname === "/careers" ? "text-primary font-medium" : ""
                }`}
              >
                Career Matches
              </Link>
              <Link
                href="/learning"
                onClick={handleLinkClick}
                className={`text-lg hover:text-primary transition-colors ${
                  pathname === "/learning" ? "text-primary font-medium" : ""
                }`}
              >
                Learning Paths
              </Link>
              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/profile" onClick={handleLinkClick}>
                    Profile
                  </Link>
                </Button>
              </div>
            </>
          )}
          <div className="pt-8 border-t">
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link
                href="/terms"
                onClick={handleLinkClick}
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                onClick={handleLinkClick}
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
