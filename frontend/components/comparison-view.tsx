"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, Calendar } from "lucide-react"
import type { PhotoEntry } from "@/lib/types"

interface ComparisonViewProps {
  photos: PhotoEntry[]
}

export default function ComparisonView({ photos }: ComparisonViewProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<[PhotoEntry | null, PhotoEntry | null]>([null, null])
  const [comparisonMode, setComparisonMode] = useState<"side-by-side" | "overlay">("side-by-side")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateTimeDifference = (date1: string, date2: string) => {
    const diff = Math.abs(new Date(date1).getTime() - new Date(date2).getTime())
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Same day"
    if (days === 1) return "1 day apart"
    if (days < 30) return `${days} days apart`
    if (days < 365) return `${Math.floor(days / 30)} months apart`
    return `${Math.floor(days / 365)} years apart`
  }

  const handlePhotoSelect = (photo: PhotoEntry, position: 0 | 1) => {
    const newSelection: [PhotoEntry | null, PhotoEntry | null] = [...selectedPhotos]
    newSelection[position] = photo
    setSelectedPhotos(newSelection)
  }

  const getQuickComparisons = () => {
    if (photos.length < 2) return []

    const sortedPhotos = [...photos].sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime())

    return [
      {
        label: "First vs Latest",
        photos: [sortedPhotos[0], sortedPhotos[sortedPhotos.length - 1]],
      },
      {
        label: "30 Days Progress",
        photos: (() => {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

          const oldPhoto = sortedPhotos.find((p) => new Date(p.taken_at) <= thirtyDaysAgo)
          const recentPhoto = sortedPhotos[sortedPhotos.length - 1]

          return oldPhoto && oldPhoto !== recentPhoto ? [oldPhoto, recentPhoto] : null
        })(),
      },
      {
        label: "90 Days Progress",
        photos: (() => {
          const ninetyDaysAgo = new Date()
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

          const oldPhoto = sortedPhotos.find((p) => new Date(p.taken_at) <= ninetyDaysAgo)
          const recentPhoto = sortedPhotos[sortedPhotos.length - 1]

          return oldPhoto && oldPhoto !== recentPhoto ? [oldPhoto, recentPhoto] : null
        })(),
      },
    ].filter((comparison) => comparison.photos !== null)
  }

  if (photos.length < 2) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Not enough photos</h3>
          <p className="text-muted-foreground">You need at least 2 photos to compare progress.</p>
        </CardContent>
      </Card>
    )
  }

  const quickComparisons = getQuickComparisons()

  return (
    <div className="space-y-6">
      {/* Quick Comparisons */}
      {quickComparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Comparisons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quickComparisons.map((comparison, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPhotos(comparison.photos as [PhotoEntry, PhotoEntry])}
                >
                  {comparison.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select First Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedPhotos[0]?.id === photo.id ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => handlePhotoSelect(photo, 0)}
                >
                  <img
                    src={photo.photo_url || "/placeholder.svg"}
                    alt={`Photo from ${formatDate(photo.taken_at)}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Second Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedPhotos[1]?.id === photo.id ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => handlePhotoSelect(photo, 1)}
                >
                  <img
                    src={photo.photo_url || "/placeholder.svg"}
                    alt={`Photo from ${formatDate(photo.taken_at)}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Display */}
      {selectedPhotos[0] && selectedPhotos[1] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Progress Comparison</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={comparisonMode === "side-by-side" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setComparisonMode("side-by-side")}
                >
                  Side by Side
                </Button>
                <Button
                  variant={comparisonMode === "overlay" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setComparisonMode("overlay")}
                >
                  Overlay
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Time Difference */}
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="font-medium">
                  {calculateTimeDifference(selectedPhotos[0].taken_at, selectedPhotos[1].taken_at)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedPhotos[0].taken_at)} → {formatDate(selectedPhotos[1].taken_at)}
                </p>
              </div>

              {/* Comparison Images */}
              {comparisonMode === "side-by-side" ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Before</span>
                    </div>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden">
                      <img
                        src={selectedPhotos[0].photo_url || "/placeholder.svg"}
                        alt="Before photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {formatDate(selectedPhotos[0].taken_at)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">After</span>
                    </div>
                    <div className="aspect-[3/4] rounded-lg overflow-hidden">
                      <img
                        src={selectedPhotos[1].photo_url || "/placeholder.svg"}
                        alt="After photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {formatDate(selectedPhotos[1].taken_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative max-w-md mx-auto">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden relative">
                    <img
                      src={selectedPhotos[0].photo_url || "/placeholder.svg"}
                      alt="Before photo"
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    <img
                      src={selectedPhotos[1].photo_url || "/placeholder.svg"}
                      alt="After photo"
                      className="w-full h-full object-cover absolute inset-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                      title="Hover to see after photo"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Hover to see after photo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
