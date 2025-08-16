"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Trash2, Download } from "lucide-react"
import type { PhotoEntry } from "@/lib/types"

interface PhotoGridProps {
  photos: PhotoEntry[]
  onPhotoDelete?: (photoId: string) => void
}

export default function PhotoGrid({ photos, onPhotoDelete }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownload = async (photo: PhotoEntry) => {
    try {
      const response = await fetch(photo.photo_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `photo-${formatDate(photo.taken_at).replace(/[^a-zA-Z0-9]/g, "-")}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading photo:", error)
    }
  }

  if (photos.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="space-y-4">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No photos yet</h3>
          <p className="text-muted-foreground">Start capturing your transformation journey!</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-[3/4] relative">
              <img
                src={photo.photo_url || "/placeholder.svg"}
                alt={`Photo from ${formatDate(photo.taken_at)}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-medium">{formatDate(photo.taken_at)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-card rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row">
              {/* Photo */}
              <div className="flex-1 max-w-2xl">
                <img
                  src={selectedPhoto.photo_url || "/placeholder.svg"}
                  alt={`Photo from ${formatDate(selectedPhoto.taken_at)}`}
                  className="w-full h-full object-contain max-h-[70vh]"
                />
              </div>

              {/* Details */}
              <div className="w-full md:w-80 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Photo Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(null)}>
                    ×
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(selectedPhoto.taken_at)}</span>
                  </div>

                  {selectedPhoto.notes && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Notes</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{selectedPhoto.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleDownload(selectedPhoto)} variant="outline" size="sm" className="flex-1">
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                  {onPhotoDelete && (
                    <Button
                      onClick={() => {
                        onPhotoDelete(selectedPhoto.id)
                        setSelectedPhoto(null)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
