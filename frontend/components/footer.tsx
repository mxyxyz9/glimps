import Link from "next/link"
import { Camera, Instagram, Twitter, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Giant Glimps Text */}
        <div className="text-center mb-12">
          <h2
            className="text-8xl md:text-9xl lg:text-[12rem] font-black text-foreground/10 leading-none tracking-tight"
            style={{ fontFamily: "var(--font-dynapuff)" }}
          >
            Glimps
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Capture your transformation journey, one moment at a time
          </p>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              
              <span className="font-bold text-xl" style={{ fontFamily: "var(--font-dynapuff)" }}>
                Glimps
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Transform your journey into beautiful timelapses</p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/capture" className="hover:text-foreground transition-colors">
                  Photo Capture
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-foreground transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/timelapse" className="hover:text-foreground transition-colors">
                  Timelapse
                </Link>
              </li>
              <li>
                <Link href="/journals" className="hover:text-foreground transition-colors">
                  Journals
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-3">
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2025 Glimps. All rights reserved.</p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">Made with ❤️ for transformation journeys</p>
        </div>
      </div>
    </footer>
  )
}
