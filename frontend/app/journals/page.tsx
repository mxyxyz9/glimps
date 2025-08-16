"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, Camera } from "lucide-react"
import Link from "next/link"
import { journalApi } from "@/lib/api/journalApi"
import { authUtils } from "@/lib/api/authApi"
import type { Journal } from "@/lib/types"

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([])
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          setError("Please sign in to view your journals")
          setLoading(false)
          return
        }

        const result = await journalApi.getJournals({
          sortBy: 'created_at',
          sortOrder: 'desc'
        })

        if (result.success) {
          setJournals(result.data || [])
          setFilteredJournals(result.data || [])
          setError(null)
        } else {
          console.error("Error fetching journals:", result.error)
          setError(result.error || "Failed to load journals")
          setJournals([])
          setFilteredJournals([])
        }
      } catch (error) {
        console.error("Error fetching journals:", error)
        setError("An unexpected error occurred while loading journals")
      } finally {
        setLoading(false)
      }
    }

    fetchJournals()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredJournals(journals)
    } else {
      const filtered = journals.filter(
        (journal) =>
          journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          journal.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          journal.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredJournals(filtered)
    }
  }, [searchQuery, journals])

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
              <h1 className="text-xl font-semibold">All Journals</h1>
            </div>
            <Button asChild>
              <Link href="/journals/new">
                <Plus className="h-4 w-4 mr-2" />
                New Journal
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journals..."
              className="pl-10 h-12"
            />
          </div>

          {/* Journals Grid */}
          {filteredJournals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJournals.map((journal) => (
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
                    <div className="space-y-4">
                      {journal.target_area && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Target:</span> {journal.target_area}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {journal.description || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(journal.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/journals/${journal.id}`}>View Journal</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/capture?journal=${journal.id}`}>
                            <Camera className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{searchQuery ? "No journals found" : "No journals yet"}</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Create your first journal to start tracking your transformation journey."}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link href="/journals/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Journal
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
