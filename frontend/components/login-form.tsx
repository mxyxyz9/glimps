"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Camera } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/authApi"

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      setError("Email and password are required")
      setIsLoading(false)
      return
    }

    try {
      const result = await authApi.login({ email, password })
      
      if (result.success) {
        router.push("/dashboard")
      } else {
        setError((result as any).message || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Camera className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-serif font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-lg text-muted-foreground">Continue your transformation journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              className="bg-card border-border text-foreground h-12"
            />
          </div>
        </div>

        <SubmitButton isLoading={isLoading} />

        <div className="text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
