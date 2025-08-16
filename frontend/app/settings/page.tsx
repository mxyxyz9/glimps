"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Settings, Shield, Download, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { authApi } from "@/lib/api/authApi"
import { journalApi } from "@/lib/api/journalApi"
import { photoApi } from "@/lib/api/photoApi"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
  })

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: false,
    autoBackup: true,
    publicProfile: false,
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await authApi.getCurrentUser()

        if (!result.success || !result.data) {
          router.push("/auth/login")
          return
        }

        const userData = result.data
        setUser(userData)

        // Use the user data directly as profile
        // The backend automatically creates user records on registration
        setProfile({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name || "",
          avatar_url: userData.avatar_url || "",
        })
        
        setProfileForm({
          full_name: userData.full_name || "",
          email: userData.email || "",
          avatar_url: userData.avatar_url || "",
        })
      } catch (error: any) {
        console.error("Error fetching user data:", error)
        // If unauthorized, redirect to login
        if (error?.message?.includes('401') || error?.message?.includes('unauthorized')) {
          router.push("/auth/login")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleProfileSave = async () => {
    if (!user) return

    setSaving(true)

    try {
      const result = await authApi.updateProfile({
        full_name: profileForm.full_name.trim(),
        avatar_url: profileForm.avatar_url.trim(),
      })

      if (!result.success) {
        throw new Error(result.message || "Failed to update profile")
      }

      // Update local state with new user data
      setUser(result.data)
      setProfile({
        id: result.data.id,
        email: result.data.email,
        full_name: result.data.full_name || "",
        avatar_url: result.data.avatar_url || "",
      })

      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match.")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters long.")
      return
    }

    setSaving(true)

    try {
      const result = await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      if (!result.success) {
        throw new Error(result.message || "Failed to change password")
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      alert("Password updated successfully!")
    } catch (error) {
      console.error("Error updating password:", error)
      alert("Failed to update password. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDataExport = async () => {
    if (!user) return

    try {
      // Fetch all user data using new APIs
      const [journalsResult, photosResult] = await Promise.all([
        journalApi.getJournals(),
        photoApi.getPhotos(),
      ])

      if (!journalsResult.success || !photosResult.success) {
        throw new Error(journalsResult.message || photosResult.message || "Failed to fetch data for export")
      }

      const journals = journalsResult.data || []
      const photos = photosResult.data || []

      const exportData = {
        profile: profile,
        journals,
        photos,
        exportDate: new Date().toISOString(),
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `timelapse-journal-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert("Data exported successfully!")
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Failed to export data. Please try again.")
    }
  }

  const handleAccountDelete = async () => {
    if (!user) return

    const confirmation = prompt('This will permanently delete your account and all data. Type "DELETE" to confirm:')

    if (confirmation !== "DELETE") {
      return
    }

    try {
      // Use authApi for account deletion
      const result = await authApi.deleteAccount()
      if (!result.success) {
        throw new Error(result.message || "Failed to delete account")
      }
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account. Please try again.")
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
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security & Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">Changing your email will require verification</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="avatar_url" className="block text-sm font-medium text-foreground">
                    Avatar URL (Optional)
                  </label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={profileForm.avatar_url}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="h-12"
                  />
                </div>

                <Button onClick={handleProfileSave} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>App Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications for reminders and updates</p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Updates</p>
                      <p className="text-sm text-muted-foreground">Receive weekly progress summaries via email</p>
                    </div>
                    <Switch
                      checked={settings.emailUpdates}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailUpdates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Backup</p>
                      <p className="text-sm text-muted-foreground">Automatically backup your data to cloud storage</p>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-muted-foreground">Allow others to view your transformation journey</p>
                    </div>
                    <Switch
                      checked={settings.publicProfile}
                      onCheckedChange={(checked) => setSettings({ ...settings, publicProfile: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Default Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Default Photo Quality</label>
                    <select className="w-full p-3 border border-border rounded-lg bg-background h-12">
                      <option value="high">High Quality</option>
                      <option value="medium">Medium Quality</option>
                      <option value="low">Low Quality</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Default Reminder Frequency</label>
                    <select className="w-full p-3 border border-border rounded-lg bg-background h-12">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security & Data Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="new_password" className="block text-sm font-medium text-foreground">
                      New Password
                    </label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="h-12"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      saving || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword
                    }
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Export Your Data</p>
                      <p className="text-sm text-muted-foreground">
                        Download all your journals, photos, and settings as JSON
                      </p>
                    </div>
                    <Button onClick={handleDataExport} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div>
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button
                      onClick={handleAccountDelete}
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Your photos are stored securely and are only accessible by you</p>
                    <p>• We use industry-standard encryption to protect your data</p>
                    <p>• Your personal information is never shared with third parties</p>
                    <p>• You can export or delete your data at any time</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
