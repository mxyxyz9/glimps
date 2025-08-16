"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import CameraCapture from "@/components/camera-capture"
import { journalApi } from "@/lib/api/journalApi"
import { photoApi } from "@/lib/api/photoApi"
import { authUtils } from "@/lib/api/authApi"
import type { Journal } from "@/lib/types"

export default function CapturePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const journalId = searchParams.get("journal")

  const [journals, setJournals] = useState<Journal[]>([])
  const [selectedJournal, setSelectedJournal] = useState<string>(journalId || "")
  const [capturedPhotoData, setCapturedPhotoData] = useState<any>(null)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          setError("Please sign in to capture photos")
          setLoading(false)
          return
        }

        const result = await journalApi.getJournals({
          sortBy: 'created_at',
          sortOrder: 'desc'
        })

        if (result.success) {
          setJournals(result.data || [])
          if (!selectedJournal && result.data && result.data.length > 0) {
            setSelectedJournal(result.data[0].id)
          }
          setError(null)
        } else {
          console.error("Error fetching journals:", result.error)
          setError(result.error || "Failed to load journals")
          setJournals([])
        }
      } catch (error) {
        console.error("Error fetching journals:", error)
        setError("An unexpected error occurred while loading journals")
      } finally {
        setLoading(false)
      }
    }

    fetchJournals()
  }, [selectedJournal])

  const handlePhotoCapture = (photoData: any) => {
    setCapturedPhotoData(photoData)
    // If photo was uploaded successfully, redirect to journal
    if (photoData && photoData.id) {
      router.push(`/journals/${selectedJournal}`)
    }
  }

  const handleSave = async () => {
    if (!capturedPhotoData || !selectedJournal) return

    setIsSaving(true)

    try {
      // Update photo with notes if provided
      if (notes.trim()) {
        const result = await photoApi.updatePhoto(capturedPhotoData.id, {
          notes: notes.trim()
        })

        if (!result.success) {
          console.error("Error updating photo notes:", result.error)
          alert(result.error || "Failed to save notes. Please try again.")
          setIsSaving(false)
          return
        }
      }

      // Redirect to journal view
      router.push(`/journals/${selectedJournal}`)
    } catch (error) {
      console.error("Error saving photo notes:", error)
      alert("Failed to save notes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const selectedJournalData = journals.find((j) => j.id === selectedJournal)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
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
            <h1 className="text-xl font-semibold">Capture Photo</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Journal Selection */}
          {journals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Journal</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedJournal}
                  onChange={(e) => setSelectedJournal(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg bg-background"
                >
                  <option value="">Choose a journal...</option>
                  {journals.map((journal) => (
                    <option key={journal.id} value={journal.id}>
                      {journal.title} ({journal.category})
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )}

          {/* Camera Capture */}
          {selectedJournal && (
            <CameraCapture
              onPhotoCapture={handlePhotoCapture}
              journalId={selectedJournal}
              targetArea={selectedJournalData?.target_area}
            />
          )}

          {/* Notes */}
          {capturedPhotoData && (
            <Card>
              <CardHeader>
                <CardTitle>Add Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this photo..."
                  rows={3}
                />
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          {capturedPhotoData && selectedJournal && notes.trim() && (
            <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full">
              {isSaving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving Notes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </>
              )}
            </Button>
          )}

          {/* No Journals Message */}
          {journals.length === 0 && !error && (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">No journals found</h3>
                <p className="text-muted-foreground mb-6">You need to create a journal before capturing photos.</p>
                <Button asChild>
                  <Link href="/journals/new">Create Your First Journal</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
