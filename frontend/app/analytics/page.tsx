"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, ArrowLeftRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { analyticsApi } from "@/lib/api/analyticsApi"
import { journalApi } from "@/lib/api/journalApi"
import { photoApi } from "@/lib/api/photoApi"
import { authUtils } from "@/lib/api/authApi"
import AnalyticsCharts from "@/components/analytics-charts"
import ComparisonView from "@/components/comparison-view"
import type { Journal, PhotoEntry } from "@/lib/types"

export default function AnalyticsPage() {
  const [journals, setJournals] = useState<Journal[]>([])
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          setError("Please sign in to view analytics")
          setLoading(false)
          return
        }

        // Fetch journals
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

        // Fetch all photos
        const photosResult = await photoApi.getPhotos({
          sortBy: 'taken_at',
          sortOrder: 'desc'
        })

        if (photosResult.success) {
          setPhotos(photosResult.data || [])
          setError(null)
        } else {
          console.error("Error fetching photos:", photosResult.error)
          setError(photosResult.error || "Failed to load analytics data")
          setPhotos([])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("An unexpected error occurred while loading analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
                <h1 className="text-xl font-semibold">Progress Analytics</h1>
                <p className="text-sm text-muted-foreground">Track your transformation journey</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {photos.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center space-x-2">
                <ArrowLeftRight className="h-4 w-4" />
                <span>Compare</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <AnalyticsCharts photos={photos} journals={journals} />
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <ComparisonView photos={photos} />
            </TabsContent>
          </Tabs>
        ) : !error ? (
          <div className="text-center py-16">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold mb-4">No Data Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start capturing photos in your journals to see detailed analytics and progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/capture">Capture First Photo</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/journals/new">Create Journal</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
