"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, RotateCcw, Check, X, Upload } from "lucide-react"
import { photoApi } from "@/lib/api/photoApi"

interface CameraCaptureProps {
  onPhotoCapture: (photoData: any) => void
  journalId?: string
  targetArea?: string
}

export default function CameraCapture({ onPhotoCapture, journalId, targetArea }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob and create URL
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
          const photoUrl = URL.createObjectURL(blob)
          setCapturedPhoto(photoUrl)
          setCapturedFile(file)
          stopCamera()
        }
      },
      "image/jpeg",
      0.9,
    )
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto)
      setCapturedPhoto(null)
    }
    setCapturedFile(null)
    setUploadProgress(0)
    startCamera()
  }, [capturedPhoto, startCamera])

  const confirmPhoto = useCallback(async () => {
    if (!capturedFile || !journalId) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const photoData = {
        file: capturedFile,
        journalId: journalId,
        takenAt: new Date().toISOString(),
      }

      const result = await photoApi.uploadPhoto(photoData, (progress) => {
        setUploadProgress(progress)
      })

      if (result.success) {
        onPhotoCapture(result.data)
        setCapturedPhoto(null)
        setCapturedFile(null)
        setUploadProgress(0)
      } else {
        console.error("Upload error:", result.error)
        alert(result.error || "Failed to upload photo. Please try again.")
      }
    } catch (error) {
      console.error("Error processing photo:", error)
      alert("Failed to process photo. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }, [capturedFile, journalId, onPhotoCapture])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = photoApi.photoUtils?.validatePhotoFile(file)
    if (validation && !validation.isValid) {
      alert(validation.errors.join('\n'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setCapturedPhoto(result)
      setCapturedFile(file)
    }
    reader.readAsDataURL(file)
  }, [])

  const switchCamera = useCallback(() => {
    stopCamera()
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }, [stopCamera])

  useEffect(() => {
    if (facingMode && !capturedPhoto) {
      startCamera()
    }
  }, [facingMode, startCamera, capturedPhoto])

  useEffect(() => {
    return () => {
      stopCamera()
      if (capturedPhoto) {
        URL.revokeObjectURL(capturedPhoto)
      }
    }
  }, [stopCamera, capturedPhoto])

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Capture Photo</h3>
        <p className="text-sm text-muted-foreground">
          {targetArea ? `Position your ${targetArea} within the guide` : "Align yourself with the positioning guide"}
        </p>
      </div>

      <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
        {/* Video stream */}
        {isStreaming && !capturedPhoto && (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {/* Positioning guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-80 border-2 border-primary/50 rounded-full opacity-50" />
            </div>
          </>
        )}

        {/* Captured photo preview */}
        {capturedPhoto && (
          <img src={capturedPhoto || "/placeholder.svg"} alt="Captured photo" className="w-full h-full object-cover" />
        )}

        {/* Placeholder when no camera */}
        {!isStreaming && !capturedPhoto && (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Hidden canvas for photo processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!capturedPhoto ? (
          <>
            {isStreaming ? (
              <>
                <Button onClick={capturePhoto} className="flex-1" size="lg">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button onClick={switchCamera} variant="outline" size="lg">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={startCamera} className="flex-1" size="lg">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            )}
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
              <Upload className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button onClick={retakePhoto} variant="outline" className="flex-1 bg-transparent" size="lg">
              <X className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button onClick={confirmPhoto} disabled={isUploading || !journalId} className="flex-1" size="lg">
              {isUploading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </Card>
  )
}
