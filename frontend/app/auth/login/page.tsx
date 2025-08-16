"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import { authUtils } from "@/lib/api/authApi"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    if (authUtils.isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  )
}
