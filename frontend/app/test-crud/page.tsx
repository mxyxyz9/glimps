"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Database, Plus, Trash2, Edit } from "lucide-react"

interface TestResult {
  operation: string
  status: "success" | "error" | "pending"
  message: string
  data?: any
}

export default function CRUDTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testJournalName, setTestJournalName] = useState("Test Journal")
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (operation: string, status: "success" | "error" | "pending", message: string, data?: any) => {
    setResults((prev) => [...prev, { operation, status, message, data }])
  }

  const clearResults = () => {
    setResults([])
  }

  const testConnection = async () => {
    setIsLoading(true)
    addResult("Connection Test", "pending", "Testing Supabase connection...")

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        addResult("Connection Test", "error", `Connection failed: ${error.message}`)
      } else {
        addResult("Connection Test", "success", "Supabase connection successful")
      }
    } catch (error) {
      addResult("Connection Test", "error", `Connection error: ${error}`)
    }
    setIsLoading(false)
  }

  const testCreateJournal = async () => {
    setIsLoading(true)
    addResult("Create Journal", "pending", "Creating test journal...")

    try {
      const { data, error } = await supabase
        .from("journals")
        .insert([
          {
            name: testJournalName,
            description: "Test journal for CRUD operations",
            category: "fitness",
          },
        ])
        .select()

      if (error) {
        addResult("Create Journal", "error", `Create failed: ${error.message}`, error)
      } else {
        addResult("Create Journal", "success", `Journal created successfully`, data)
      }
    } catch (error) {
      addResult("Create Journal", "error", `Create error: ${error}`)
    }
    setIsLoading(false)
  }

  const testReadJournals = async () => {
    setIsLoading(true)
    addResult("Read Journals", "pending", "Fetching journals...")

    try {
      const { data, error } = await supabase.from("journals").select("*").limit(5)

      if (error) {
        addResult("Read Journals", "error", `Read failed: ${error.message}`, error)
      } else {
        addResult("Read Journals", "success", `Found ${data?.length || 0} journals`, data)
      }
    } catch (error) {
      addResult("Read Journals", "error", `Read error: ${error}`)
    }
    setIsLoading(false)
  }

  const testUpdateJournal = async () => {
    setIsLoading(true)
    addResult("Update Journal", "pending", "Updating journal...")

    try {
      // First get a journal to update
      const { data: journals, error: fetchError } = await supabase.from("journals").select("id").limit(1)

      if (fetchError || !journals?.length) {
        addResult("Update Journal", "error", "No journals found to update")
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("journals")
        .update({ description: "Updated test journal description" })
        .eq("id", journals[0].id)
        .select()

      if (error) {
        addResult("Update Journal", "error", `Update failed: ${error.message}`, error)
      } else {
        addResult("Update Journal", "success", `Journal updated successfully`, data)
      }
    } catch (error) {
      addResult("Update Journal", "error", `Update error: ${error}`)
    }
    setIsLoading(false)
  }

  const testDeleteJournal = async () => {
    setIsLoading(true)
    addResult("Delete Journal", "pending", "Deleting journal...")

    try {
      // First get a journal to delete
      const { data: journals, error: fetchError } = await supabase.from("journals").select("id").limit(1)

      if (fetchError || !journals?.length) {
        addResult("Delete Journal", "error", "No journals found to delete")
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.from("journals").delete().eq("id", journals[0].id).select()

      if (error) {
        addResult("Delete Journal", "error", `Delete failed: ${error.message}`, error)
      } else {
        addResult("Delete Journal", "success", `Journal deleted successfully`, data)
      }
    } catch (error) {
      addResult("Delete Journal", "error", `Delete error: ${error}`)
    }
    setIsLoading(false)
  }

  const runAllTests = async () => {
    clearResults()
    await testConnection()
    await testReadJournals()
    await testCreateJournal()
    await testReadJournals()
    await testUpdateJournal()
    await testDeleteJournal()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supabase CRUD Test</h1>
        <p className="text-muted-foreground">Test your Supabase connection and CRUD operations for the Glimps app.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Operations
            </CardTitle>
            <CardDescription>Test individual CRUD operations on your Supabase database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Journal Name</label>
              <Input
                value={testJournalName}
                onChange={(e) => setTestJournalName(e.target.value)}
                placeholder="Enter journal name for testing"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={testConnection} disabled={isLoading} size="sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Connect
              </Button>
              <Button onClick={testReadJournals} disabled={isLoading} size="sm" variant="outline">
                Read
              </Button>
              <Button onClick={testCreateJournal} disabled={isLoading} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
              <Button onClick={testUpdateJournal} disabled={isLoading} size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-1" />
                Update
              </Button>
              <Button onClick={testDeleteJournal} disabled={isLoading} size="sm" variant="outline">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={runAllTests} disabled={isLoading} className="w-full">
                Run All Tests
              </Button>
              <Button onClick={clearResults} disabled={isLoading} variant="ghost" className="w-full mt-2">
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results of your database operations will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tests run yet.</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{result.operation}</span>
                      <Badge
                        variant={
                          result.status === "success"
                            ? "default"
                            : result.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {result.status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {result.status === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-muted-foreground">View Data</summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-orange-600">Database Setup Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you're seeing "table does not exist" errors, you need to run the SQL script to create the database tables
            first.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">To fix database issues:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                Run the SQL script: <code className="bg-background px-1 rounded">scripts/01-create-tables.sql</code>
              </li>
              <li>This will create all necessary tables (profiles, journals, photo_entries, reminders)</li>
              <li>Once tables are created, all CRUD operations should work properly</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
