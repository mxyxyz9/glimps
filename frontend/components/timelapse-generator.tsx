"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Download, Settings, Film } from "lucide-react"
import type { PhotoEntry } from "@/lib/types"

interface TimelapseGeneratorProps {
  photos: PhotoEntry[]
  journalTitle?: string
}

interface TimelapseSettings {
  duration: number // seconds per photo
  transition: "none" | "fade" | "slide"
  quality: "low" | "medium" | "high"
  resolution: "720p" | "1080p"
  fps: 24 | 30 | 60
}

export default function TimelapseGenerator({ photos, journalTitle }: TimelapseGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [settings, setSettings] = useState<TimelapseSettings>({
    duration: 0.5,
    transition: "fade",
    quality: "medium",
    resolution: "720p",
    fps: 30,
  })

  // Sort photos by date
  const sortedPhotos = [...photos].sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime())

  const preloadImages = useCallback(async (photoUrls: string[]) => {
    const images = await Promise.all(
      photoUrls.map((url) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = url
        })
      }),
    )
    return images
  }, [])

  const drawFrame = useCallback(
    (canvas: HTMLCanvasElement, images: HTMLImageElement[], frameIndex: number, transition: string) => {
      const ctx = canvas.getContext("2d")
      if (!ctx || images.length === 0) return

      const currentImage = images[Math.floor(frameIndex) % images.length]
      const nextImage = images[Math.floor(frameIndex + 1) % images.length]

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (transition === "fade" && nextImage && frameIndex % 1 !== 0) {
        // Fade transition
        const alpha = frameIndex % 1

        // Draw current image
        ctx.globalAlpha = 1 - alpha
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height)

        // Draw next image with fade
        ctx.globalAlpha = alpha
        ctx.drawImage(nextImage, 0, 0, canvas.width, canvas.height)

        ctx.globalAlpha = 1
      } else {
        // No transition or slide
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height)
      }
    },
    [],
  )

  const generatePreview = useCallback(async () => {
    if (!canvasRef.current || sortedPhotos.length < 2) return

    const canvas = canvasRef.current
    const resolution = settings.resolution === "1080p" ? { width: 1080, height: 1920 } : { width: 720, height: 1280 }

    canvas.width = resolution.width
    canvas.height = resolution.height

    try {
      const images = await preloadImages(sortedPhotos.map((p) => p.photo_url))

      // Draw first frame
      drawFrame(canvas, images, 0, settings.transition)

      // Set up animation loop for preview
      let animationId: number
      let frame = 0
      const framesPerPhoto = settings.duration * settings.fps

      const animate = () => {
        if (isPlaying) {
          drawFrame(canvas, images, frame / framesPerPhoto, settings.transition)
          frame = (frame + 1) % (images.length * framesPerPhoto)
          setCurrentFrame(Math.floor(frame / framesPerPhoto))
          animationId = requestAnimationFrame(animate)
        }
      }

      if (isPlaying) {
        animate()
      }

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    } catch (error) {
      console.error("Error generating preview:", error)
    }
  }, [sortedPhotos, settings, isPlaying, drawFrame, preloadImages])

  const generateTimelapse = useCallback(async () => {
    if (!canvasRef.current || sortedPhotos.length < 2) return

    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      const resolution = settings.resolution === "1080p" ? { width: 1080, height: 1920 } : { width: 720, height: 1280 }

      canvas.width = resolution.width
      canvas.height = resolution.height

      const images = await preloadImages(sortedPhotos.map((p) => p.photo_url))

      // Create MediaRecorder for video generation
      const stream = canvas.captureStream(settings.fps)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        setGeneratedVideoUrl(url)
        setIsGenerating(false)
      }

      mediaRecorder.start()

      // Generate frames
      const framesPerPhoto = settings.duration * settings.fps
      const totalFrames = images.length * framesPerPhoto

      for (let frame = 0; frame < totalFrames; frame++) {
        drawFrame(canvas, images, frame / framesPerPhoto, settings.transition)

        // Wait for next frame
        await new Promise((resolve) => setTimeout(resolve, 1000 / settings.fps))
      }

      mediaRecorder.stop()
    } catch (error) {
      console.error("Error generating timelapse:", error)
      setIsGenerating(false)
    }
  }, [sortedPhotos, settings, drawFrame, preloadImages])

  const downloadTimelapse = useCallback(() => {
    if (!generatedVideoUrl) return

    const a = document.createElement("a")
    a.href = generatedVideoUrl
    a.download = `${journalTitle || "timelapse"}-${new Date().toISOString().split("T")[0]}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [generatedVideoUrl, journalTitle])

  useEffect(() => {
    generatePreview()
  }, [generatePreview])

  useEffect(() => {
    return () => {
      if (generatedVideoUrl) {
        URL.revokeObjectURL(generatedVideoUrl)
      }
    }
  }, [generatedVideoUrl])

  if (sortedPhotos.length < 2) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Not enough photos</h3>
          <p className="text-muted-foreground">You need at least 2 photos to create a timelapse.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Timelapse Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration per Photo</label>
              <div className="space-y-2">
                <Slider
                  value={[settings.duration]}
                  onValueChange={([value]) => setSettings((prev) => ({ ...prev, duration: value }))}
                  min={0.1}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">{settings.duration}s per photo</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transition Effect</label>
              <Select
                value={settings.transition}
                onValueChange={(value: any) => setSettings((prev) => ({ ...prev, transition: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution</label>
              <Select
                value={settings.resolution}
                onValueChange={(value: any) => setSettings((prev) => ({ ...prev, resolution: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (720x1280)</SelectItem>
                  <SelectItem value="1080p">1080p (1080x1920)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Frame Rate</label>
              <Select
                value={settings.fps.toString()}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, fps: Number.parseInt(value) as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 FPS</SelectItem>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="60">60 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Estimated Duration</p>
              <p className="text-sm text-muted-foreground">
                {(sortedPhotos.length * settings.duration).toFixed(1)} seconds
              </p>
            </div>
            <div>
              <p className="font-medium">Total Photos</p>
              <p className="text-sm text-muted-foreground">{sortedPhotos.length} photos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative max-w-sm mx-auto">
              <canvas ref={canvasRef} className="w-full h-auto rounded-lg border" style={{ aspectRatio: "9/16" }} />

              {/* Preview Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Frame {currentFrame + 1} of {sortedPhotos.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {sortedPhotos[currentFrame] && new Date(sortedPhotos[currentFrame].taken_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Timelapse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={generateTimelapse} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Film className="h-4 w-4 mr-2" />
                  Generate Timelapse
                </>
              )}
            </Button>

            {generatedVideoUrl && (
              <Button onClick={downloadTimelapse} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>

          {generatedVideoUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Generated Timelapse</p>
              <video
                ref={videoRef}
                src={generatedVideoUrl}
                controls
                className="w-full max-w-sm mx-auto rounded-lg"
                style={{ aspectRatio: "9/16" }}
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Timelapse will be generated in WebM format</p>
            <p>• Higher resolutions and frame rates will take longer to generate</p>
            <p>• Keep this tab active during generation for best results</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
