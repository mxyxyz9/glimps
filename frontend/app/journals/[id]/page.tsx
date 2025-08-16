"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Camera, Grid, TimerIcon as Timeline, BarChart3, Settings, Trash2, Film } from "lucide-react"
import Link from "next/link"
import { journalApi } from "@/lib/api/journalApi"
import { photoApi } from "@/lib/api/photoApi"
import { authUtils } from "@/lib/api/authApi"
import PhotoGrid from "@/components/photo-grid"
import TimelineView from "@/components/timeline-view"
import type { Journal, PhotoEntry } from "@/lib/types"

export default function JournalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const journalId = params.id as string

  const [journal, setJournal] = useState<Journal | null>(null)
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("gallery")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJournalData = async () => {
      try {
        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          setError("Please sign in to view this journal")
          setLoading(false)
          return
        }

        // Fetch journal details
        const journalResult = await journalApi.getJournal(journalId)
        
        if (!journalResult.success) {
          console.error("Error fetching journal:", journalResult.error)
          setError(journalResult.error || "Journal not found")
          router.push("/dashboard")
          return
        }

        setJournal(journalResult.data)

        // Fetch photos for this journal
        const photosResult = await journalApi.getJournalPhotos(journalId, {
          sortBy: 'taken_at',
          sortOrder: 'desc'
        })

        if (photosResult.success) {
          setPhotos(photosResult.data || [])
        } else {
          console.error("Error fetching photos:", photosResult.error)
          // Don't set error for photos, just log it
          setPhotos([])
        }
      } catch (error) {
        console.error("Error fetching journal data:", error)
        setError("An unexpected error occurred while loading the journal")
      } finally {
        setLoading(false)
      }
    }

    fetchJournalData()
  }, [journalId, router])

  const handlePhotoDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      const result = await photoApi.deletePhoto(photoId)

      if (result.success) {
        setPhotos((prev) => prev.filter((photo) => photo.id !== photoId))
      } else {
        console.error("Error deleting photo:", result.error)
        alert(result.error || "Failed to delete photo. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting photo:", error)
      alert("Failed to delete photo. Please try again.")
    }
  }

  const handleJournalDelete = async () => {
    if (!journal) return
    if (
      !confirm(`Are you sure you want to delete "${journal.title}"? This will also delete all photos in this journal.`)
    )
      return

    try {
      const result = await journalApi.deleteJournal(journalId)

      if (result.success) {
        router.push("/dashboard")
      } else {
        console.error("Error deleting journal:", result.error)
        alert(result.error || "Failed to delete journal. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting journal:", error)
      alert("Failed to delete journal. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !journal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">{error || "Journal not found"}</h2>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

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
                <h1 className="text-xl font-semibold">{journal.title}</h1>
                <p className="text-sm text-muted-foreground capitalize">
                  {journal.category} {journal.target_area && `• ${journal.target_area}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button asChild>
                <Link href={`/capture?journal=${journalId}`}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Link>
              </Button>
              {photos.length >= 2 && (
                <Button asChild variant="outline">
                  <Link href={`/timelapse?journal=${journalId}`}>
                    <Film className="h-4 w-4 mr-2" />
                    Timelapse
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleJournalDelete}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Journal Info */}
          {journal.description && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{journal.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{photos.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Active</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {photos.length > 0
                    ? Math.ceil(
                        (new Date().getTime() -
                          new Date(Math.min(...photos.map((p) => new Date(p.taken_at).getTime()))).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Photo</CardTitle>
                <Timeline className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {photos.length > 0
                    ? new Date(photos[0].taken_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "None"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Created</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {new Date(journal.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Photos Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery" className="flex items-center space-x-2">
                <Grid className="h-4 w-4" />
                <span>Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Timeline className="h-4 w-4" />
                <span>Timeline</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="mt-6">
              <PhotoGrid photos={photos} onPhotoDelete={handlePhotoDelete} />
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <TimelineView photos={photos} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
