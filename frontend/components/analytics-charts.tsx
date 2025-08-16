"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar, TrendingUp, Camera, Target } from "lucide-react"
import type { PhotoEntry, Journal } from "@/lib/types"

interface AnalyticsChartsProps {
  photos: PhotoEntry[]
  journals: Journal[]
}

export default function AnalyticsCharts({ photos, journals }: AnalyticsChartsProps) {
  // Calculate photo frequency by month
  const getPhotosByMonth = () => {
    const monthlyData: Record<string, number> = {}

    photos.forEach((photo) => {
      const date = new Date(photo.taken_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
    })

    return Object.entries(monthlyData)
      .map(([month, count]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        photos: count,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6) // Last 6 months
  }

  // Calculate weekly consistency
  const getWeeklyConsistency = () => {
    const weeklyData: Record<string, number> = {}
    const now = new Date()

    // Generate last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - i * 7)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekKey = `Week ${8 - i}`
      weeklyData[weekKey] = photos.filter((photo) => {
        const photoDate = new Date(photo.taken_at)
        return photoDate >= weekStart && photoDate <= weekEnd
      }).length
    }

    return Object.entries(weeklyData).map(([week, count]) => ({
      week,
      photos: count,
      consistency: count > 0 ? 100 : 0,
    }))
  }

  // Calculate category distribution
  const getCategoryDistribution = () => {
    const categoryCount: Record<string, number> = {}

    journals.forEach((journal) => {
      const photosInJournal = photos.filter((photo) => photo.journal_id === journal.id).length
      if (photosInJournal > 0) {
        categoryCount[journal.category] = (categoryCount[journal.category] || 0) + photosInJournal
      }
    })

    const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

    return Object.entries(categoryCount).map(([category, count], index) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      fill: colors[index % colors.length],
    }))
  }

  // Calculate streak data
  const getCurrentStreak = () => {
    if (photos.length === 0) return 0

    const sortedPhotos = [...photos].sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime())
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = 0
    const currentDate = new Date(today)

    for (let i = 0; i < 30; i++) {
      // Check last 30 days
      const hasPhotoOnDate = sortedPhotos.some((photo) => {
        const photoDate = new Date(photo.taken_at)
        photoDate.setHours(0, 0, 0, 0)
        return photoDate.getTime() === currentDate.getTime()
      })

      if (hasPhotoOnDate) {
        streak++
      } else if (streak > 0) {
        break
      }

      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  const monthlyData = getPhotosByMonth()
  const weeklyData = getWeeklyConsistency()
  const categoryData = getCategoryDistribution()
  const currentStreak = getCurrentStreak()
  const totalPhotos = photos.length
  const activeJournals = journals.length
  const avgPhotosPerWeek =
    photos.length > 0
      ? Math.round(
          (photos.length /
            Math.max(
              1,
              Math.ceil(
                (new Date().getTime() - new Date(photos[photos.length - 1]?.taken_at || new Date()).getTime()) /
                  (7 * 24 * 60 * 60 * 1000),
              ),
            )) *
            10,
        ) / 10
      : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPhotos}</div>
            <p className="text-xs text-muted-foreground">
              {totalPhotos > 0 && photos.length > 1 && (
                <>+{Math.round(((totalPhotos - (totalPhotos - 1)) / Math.max(1, totalPhotos - 1)) * 100)}% from last</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {currentStreak > 0 ? "days in a row" : "Start your streak!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Journals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJournals}</div>
            <p className="text-xs text-muted-foreground">tracking goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPhotosPerWeek}</div>
            <p className="text-xs text-muted-foreground">photos per week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                photos: {
                  label: "Photos",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="photos" fill="var(--color-photos)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Consistency */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                photos: {
                  label: "Photos",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="photos"
                    stroke="var(--color-photos)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-photos)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Photos",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {categoryData.map((entry, index) => (
                  <div key={entry.category} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                    <span className="text-sm">{entry.category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Most Active Day</p>
                  <p className="text-sm text-muted-foreground">
                    {photos.length > 0
                      ? (() => {
                          const dayCount: Record<string, number> = {}
                          photos.forEach((photo) => {
                            const day = new Date(photo.taken_at).toLocaleDateString("en-US", { weekday: "long" })
                            dayCount[day] = (dayCount[day] || 0) + 1
                          })
                          const mostActiveDay = Object.entries(dayCount).reduce((a, b) =>
                            dayCount[a[0]] > dayCount[b[0]] ? a : b,
                          )
                          return `${mostActiveDay[0]} (${mostActiveDay[1]} photos)`
                        })()
                      : "No data yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Best Month</p>
                  <p className="text-sm text-muted-foreground">
                    {monthlyData.length > 0
                      ? (() => {
                          const bestMonth = monthlyData.reduce((a, b) => (a.photos > b.photos ? a : b))
                          return `${bestMonth.month} (${bestMonth.photos} photos)`
                        })()
                      : "No data yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Journey Started</p>
                  <p className="text-sm text-muted-foreground">
                    {photos.length > 0
                      ? (() => {
                          const firstPhoto = photos[photos.length - 1]
                          const daysSince = Math.floor(
                            (new Date().getTime() - new Date(firstPhoto.taken_at).getTime()) / (24 * 60 * 60 * 1000),
                          )
                          return `${daysSince} days ago`
                        })()
                      : "Start today!"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
