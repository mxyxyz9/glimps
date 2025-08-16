"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MessageSquare } from "lucide-react"
import type { PhotoEntry } from "@/lib/types"

interface TimelineViewProps {
  photos: PhotoEntry[]
}

export default function TimelineView({ photos }: TimelineViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Group photos by date
  const photosByDate = photos.reduce(
    (acc, photo) => {
      const date = new Date(photo.taken_at).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(photo)
      return acc
    },
    {} as Record<string, PhotoEntry[]>,
  )

  const sortedDates = Object.keys(photosByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (photos.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="space-y-4">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No timeline data</h3>
          <p className="text-muted-foreground">Capture photos to see your progress timeline!</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-4 pl-7">
            {photosByDate[date]
              .sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime())
              .map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 aspect-[3/4] md:aspect-square">
                        <img
                          src={photo.photo_url || "/placeholder.svg"}
                          alt={`Photo from ${formatTime(photo.taken_at)}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatTime(photo.taken_at)}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.abs(new Date().getTime() - new Date(photo.taken_at).getTime()) < 24 * 60 * 60 * 1000
                              ? "Today"
                              : `${Math.floor((new Date().getTime() - new Date(photo.taken_at).getTime()) / (24 * 60 * 60 * 1000))} days ago`}
                          </span>
                        </div>
                        {photo.notes && (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Notes</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{photo.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
