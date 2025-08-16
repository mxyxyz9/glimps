"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Film } from "lucide-react"
import Link from "next/link"
import { journalApi } from "@/lib/api/journalApi"
import { authUtils } from "@/lib/api/authApi"
import TimelapseGenerator from "@/components/timelapse-generator"
import type { Journal, PhotoEntry } from "@/lib/types"

export default function TimelapsePage() {
  const searchParams = useSearchParams()
  const preselectedJournalId = searchParams.get("journal")

  const [journals, setJournals] = useState<Journal[]>([])
  const [selectedJournalId, setSelectedJournalId] = useState<string>(preselectedJournalId || "")
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          setError("Please sign in to create timelapses")
          setLoading(false)
          return
        }

        const result = await journalApi.getJournals({
          sortBy: 'created_at',
          sortOrder: 'desc'
        })

        if (result.success) {
          setJournals(result.data || [])
          if (result.data && result.data.length > 0 && !preselectedJournalId) {
            setSelectedJournalId(result.data[0].id)
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
  }, [preselectedJournalId])

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!selectedJournalId) {
        setPhotos([])
        return
      }

      try {
        const result = await journalApi.getJournalPhotos(selectedJournalId, {
          sortBy: 'taken_at',
          sortOrder: 'asc'
        })

        if (result.success) {
          setPhotos(result.data || [])
        } else {
          console.error("Error fetching photos:", result.error)
          setPhotos([])
        }
      } catch (error) {
        console.error("Error fetching photos:", error)
        setPhotos([])
      }
    }

    fetchPhotos()
  }, [selectedJournalId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const selectedJournal = journals.find((j) => j.id === selectedJournalId)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Timelapse Generator</h1>
                <p className="text-sm text-muted-foreground">Create videos from your photo sequences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
          {journals.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Select Journal</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedJournalId} onValueChange={setSelectedJournalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a journal..." />
                  </SelectTrigger>
                  <SelectContent>
                    {journals.map((journal) => (
                      <SelectItem key={journal.id} value={journal.id}>
                        {journal.title} ({journal.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedJournal && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Selected:</span> {selectedJournal.title}
                    </p>
                    {selectedJournal.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedJournal.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{photos.length} photos available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : !error ? (
            <Card className="text-center py-12">
              <CardContent>
                <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No journals found</h3>
                <p className="text-muted-foreground mb-6">
                  You need to create a journal with photos before generating a timelapse.
                </p>
                <Button asChild>
                  <Link href="/journals/new">Create Your First Journal</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Timelapse Generator */}
          {selectedJournalId && photos.length > 0 && (
            <TimelapseGenerator photos={photos} journalTitle={selectedJournal?.title} />
          )}

          {/* No Photos Message */}
          {selectedJournalId && photos.length === 0 && !error && (
            <Card className="text-center py-12">
              <CardContent>
                <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No photos in this journal</h3>
                <p className="text-muted-foreground mb-6">Add some photos to this journal to create a timelapse.</p>
                <Button asChild>
                  <Link href={`/capture?journal=${selectedJournalId}`}>Capture Photos</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
