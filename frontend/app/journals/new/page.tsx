"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { journalApi } from "@/lib/api/journalApi"
import { authUtils } from "@/lib/api/authApi"

const categories = [
  { value: "fitness", label: "Fitness & Body" },
  { value: "skincare", label: "Skincare & Face" },
  { value: "hair", label: "Hair Growth" },
  { value: "weight", label: "Weight Loss/Gain" },
  { value: "other", label: "Other" },
]

export default function NewJournalPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    target_area: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.category) return

    setIsSaving(true)
    setError(null)

    try {
      // Check if user is authenticated
      if (!authUtils.isAuthenticated()) {
        setError("Please sign in to create a journal.")
        setIsSaving(false)
        return
      }

      const journalData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        target_area: formData.target_area.trim() || null,
      }

      console.log("Creating journal with data:", journalData)

      const result = await journalApi.createJournal(journalData)

      if (result.success) {
        console.log("Journal created successfully:", result.data)
        router.push(`/journals/${result.data.id}`)
      } else {
        console.error("Error creating journal:", result.error)
        setError(result.error || "Failed to create journal. Please try again.")
      }
    } catch (error) {
      console.error("Unexpected error creating journal:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Create New Journal</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Journal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-foreground">
                  Title *
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Fitness Journey"
                  required
                  disabled={isSaving}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-foreground">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={isSaving}
                  className="w-full p-3 border border-border rounded-lg bg-background h-12"
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="target_area" className="block text-sm font-medium text-foreground">
                  Target Area (Optional)
                </label>
                <Input
                  id="target_area"
                  value={formData.target_area}
                  onChange={(e) => setFormData({ ...formData, target_area: e.target.value })}
                  placeholder="Face, Arms, Full Body, etc."
                  disabled={isSaving}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your goals and what you want to track..."
                  rows={4}
                  disabled={isSaving}
                />
              </div>

              <Button
                type="submit"
                disabled={isSaving || !formData.title.trim() || !formData.category}
                size="lg"
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Journal
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
