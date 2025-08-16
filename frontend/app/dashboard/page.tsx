"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Camera, BarChart3, Calendar, TrendingUp, Film, Settings } from "lucide-react"
import Link from "next/link"
import { journalApi } from "@/lib/api/journalApi"
import { photoApi } from "@/lib/api/photoApi"
import { authApi, authUtils } from "@/lib/api/authApi"
import type { Journal, PhotoEntry } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [journals, setJournals] = useState<Journal[]>([])
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          router.push("/auth/login")
          return
        }

        // Get current user
        const userResult = await authApi.getCurrentUser()
        if (userResult.success) {
          setUser(userResult.data)
        } else {
          console.error("Error fetching user:", userResult.error)
          router.push("/auth/login")
          return
        }

        // Fetch user's journals
        const journalsResult = await journalApi.getJournals({
          sortBy: 'created_at',
          sortOrder: 'desc'
        })

        if (journalsResult.success) {
          setJournals(journalsResult.data || [])
        } else {
          console.error("Error fetching journals:", journalsResult.error)
          setJournals([])
        }

        // Fetch recent photos
        const photosResult = await photoApi.getPhotos({
          sortBy: 'taken_at',
          sortOrder: 'desc',
          limit: 10
        })

        if (photosResult.success) {
          setPhotos(photosResult.data || [])
          setError(null)
        } else {
          console.error("Error fetching photos:", photosResult.error)
          setError(photosResult.error || "Failed to load dashboard data")
          setPhotos([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("An unexpected error occurred while loading the dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await authApi.logout()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

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
            <Camera className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-serif font-bold">Timelapse Journal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild size="lg" className="h-auto p-6 flex-col space-y-2">
              <Link href="/capture">
                <Camera className="h-6 w-6" />
                <span>Capture Photo</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href="/journals/new">
                <Plus className="h-6 w-6" />
                <span>New Journal</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href="/analytics">
                <BarChart3 className="h-6 w-6" />
                <span>Analytics</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href="/timelapse">
                <Film className="h-6 w-6" />
                <span>Timelapse</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href="/journals">
                <Calendar className="h-6 w-6" />
                <span>All Journals</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href="/settings">
                <Settings className="h-6 w-6" />
                <span>Settings</span>
              </Link>
            </Button>
          </div>

          {/* Journals Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Journals</h2>
              {journals.length > 0 && (
                <Button asChild variant="outline">
                  <Link href="/journals">View All</Link>
                </Button>
              )}
            </div>

            {journals.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {journals.slice(0, 6).map((journal) => (
                  <Card key={journal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{journal.title}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                          {journal.category}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {journal.description || "No description"}
                      </p>
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/journals/${journal.id}`}>View</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/capture?journal=${journal.id}`}>
                            <Camera className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No journals yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first journal to start tracking your transformation journey.
                  </p>
                  <Button asChild>
                    <Link href="/journals/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Journal
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Overview */}
          {journals.length > 0 && (
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Journals</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{journals.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Photos Captured</CardTitle>
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{photos.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {photos.filter((photo) => {
                      const photoDate = new Date(photo.taken_at)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return photoDate >= weekAgo
                    }).length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">View Analytics</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <Link href="/analytics">View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
