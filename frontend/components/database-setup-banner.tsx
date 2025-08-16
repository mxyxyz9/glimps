"use client"

import { AlertTriangle, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function DatabaseSetupBanner() {
  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Database Setup Required:</strong> Please run the SQL script to create database tables.
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-4 border-amber-300 text-amber-800 hover:bg-amber-100 bg-transparent"
          onClick={() => {
            // This will be handled by the v0 interface
            console.log("[v0] User clicked setup database button")
          }}
        >
          <Database className="h-4 w-4 mr-2" />
          Setup Database
        </Button>
      </AlertDescription>
    </Alert>
  )
}
