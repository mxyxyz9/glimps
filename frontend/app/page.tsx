"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles, Timer, Camera } from "lucide-react"
import Link from "next/link"
import { authUtils } from "@/lib/api/authApi"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    if (authUtils.isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4">
        <div className="relative py-20 lg:py-32">
          <div className="text-center space-y-12 max-w-5xl mx-auto">
            {/* Logo and Brand */}
            <div className="flex flex-col items-center space-y-6">
              <div className="space-y-2">
                <h1
                  className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-dynapuff)" }}
                >
                  Glimps
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground font-medium tracking-wide uppercase">
                  Timelapse Portrait Journal
                </p>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight text-foreground max-w-4xl mx-auto">
                Watch Your Story
                <span className="block text-foreground/70">Unfold Over Time</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Transform your journey into a visual masterpiece. Capture, track, and create stunning timelapses of your
                personal evolution in 2025.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                asChild
                className="btn-sweep-primary text-base px-8 py-4 h-auto rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <Link href="/auth/sign-up" className="flex items-center gap-2">
                  
                  Start Your Journey
                  
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="btn-sweep-outline text-base px-8 py-4 h-auto rounded-full border-2 border-foreground/20 hover:border-foreground/40 bg-transparent hover:bg-foreground/5 transition-all duration-300"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>

            {/* Stats or Social Proof */}
            <div className="flex flex-wrap justify-center gap-8 pt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Trusted by creators worldwide</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>Capture moments in seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>AI-powered insights</span>
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-foreground/8 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-foreground/6 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="py-20 border-t border-foreground/10">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Everything You Need</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional tools designed for creators who want to document their transformation journey with precision
              and style.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group text-center space-y-6 p-8 rounded-3xl bg-gradient-to-br from-foreground/5 to-transparent border border-foreground/10 hover:border-foreground/20 transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-center">
                <div className="p-6 bg-foreground/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  {/* Camera icon */}
                  <Camera className="h-10 w-10 text-foreground" />
                </div>
              </div>
              <h4 className="text-xl font-serif font-semibold">Precision Capture</h4>
              <p className="text-muted-foreground leading-relaxed">
                Guided positioning and consistent lighting ensure every photo perfectly captures your progress with
                professional quality.
              </p>
            </div>

            <div className="group text-center space-y-6 p-8 rounded-3xl bg-gradient-to-br from-foreground/5 to-transparent border border-foreground/10 hover:border-foreground/20 transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-center">
                <div className="p-6 bg-foreground/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Timer className="h-10 w-10 text-foreground" />
                </div>
              </div>
              <h4 className="text-xl font-serif font-semibold">Smart Analytics</h4>
              <p className="text-muted-foreground leading-relaxed">
                Advanced insights and beautiful visualizations help you understand patterns and celebrate milestones in
                your journey.
              </p>
            </div>

            <div className="group text-center space-y-6 p-8 rounded-3xl bg-gradient-to-br from-foreground/5 to-transparent border border-foreground/10 hover:border-foreground/20 transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-center">
                <div className="p-6 bg-foreground/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-10 w-10 text-foreground" />
                </div>
              </div>
              <h4 className="text-xl font-serif font-semibold">Cinematic Timelapses</h4>
              <p className="text-muted-foreground leading-relaxed">
                Transform your photos into stunning timelapse videos that showcase your incredible transformation story.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
