"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Settings, User, LogOut, Menu, X, Home, FolderOpen, Play } from "lucide-react"
import { authApi, authUtils } from "@/lib/api/authApi"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      if (authUtils.isAuthenticated()) {
        try {
          const result = await authApi.getCurrentUser()
          if (result.success) {
            setUser(result.data)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error("Error fetching user:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await authApi.logout()
      setUser(null)
      setIsMenuOpen(false)
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navItems = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/journals", label: "Journals", icon: FolderOpen },
        { href: "/capture", label: "Capture", icon: Play },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/timelapse", label: "Timelapse", icon: Play },
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    : []

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-card/80 backdrop-blur-md border border-border rounded-full py-3 shadow-lg px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-dynapuff)" }}>
              Glimps
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="rounded-full px-4 py-2 h-auto"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden rounded-full p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>

                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center space-x-3">
                  
                  <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm" className="rounded-full px-4 py-2 h-auto">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full px-4 py-2 h-auto">
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start rounded-full px-4 py-2 h-auto"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button variant="ghost" size="sm" className="rounded-full px-3 py-2 h-auto">
                  <User className="h-4 w-4 mr-2" />
                  {user.email?.split("@")[0]}
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
