"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-provider"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, ChartContainer } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

export default function ChartsPage() {
  const [projectData, setProjectData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchProjectData = async () => {
      try {
        // In a real app, you would fetch actual project data
        // For demo purposes, we'll use mock data

        // Progress over time data (monthly)
        const progressData = Array.from({ length: 24 }, (_, i) => {
          const month = new Date(2023, i % 12, 1)
          const plannedProgress = Math.min(100, Math.floor((i + 1) * 4.5))
          const actualProgress = Math.min(100, Math.floor(plannedProgress * (0.9 + Math.random() * 0.2)))

          return {
            month: month.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
            planned: plannedProgress,
            actual: actualProgress,
          }
        })

        // Stage-wise completion data
        const stageData = [
          { name: "Excavation", planned: 100, actual: 100 },
          { name: "Substructure", planned: 100, actual: 100 },
          { name: "Superstructure", planned: 100, actual: 98.16 },
          { name: "Finishing", planned: 51.24, actual: 10.5 },
        ]

        // Area-wise completion data
        const areaData = [
          { name: "Cafeteria Area", planned: 77.48, actual: 77.48 },
          { name: "Tower Area", planned: 87.53, actual: 79.81 },
        ]

        // Overall completion
        const overallCompletion = {
          planned: 84.51,
          actual: 78.97,
        }

        setProjectData({
          progressData,
          stageData,
          areaData,
          overallCompletion,
        })
      } catch (error) {
        console.error("Error fetching project data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[300px] bg-gray-200 rounded animate-pulse"></div>
            <div className="h-[300px] bg-gray-200 rounded animate-pulse"></div>
            <div className="h-[300px] bg-gray-200 rounded animate-pulse"></div>
            <div className="h-[300px] bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" className="flex items-center gap-2 mb-4" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <h1 className="text-2xl font-bold">Project Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Project Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Project Completion %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 mb-2">
                    Planned progress
                  </div>
                  <div className="text-2xl font-bold">{projectData.overallCompletion.planned}%</div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-red-700 mb-2">
                    Actual progress
                  </div>
                  <div className="text-2xl font-bold">{projectData.overallCompletion.actual}%</div>
                </div>
              </div>

              <ChartContainer className="h-[300px]">
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectData.progressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} interval={1} />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, ""]} labelFormatter={(label) => `Month: ${label}`} />
                      <Legend />
                      <Line type="monotone" dataKey="planned" name="Planned" stroke="#3b82f6" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="actual" name="Actual" stroke="#ef4444" />
                    </LineChart>
                  </ResponsiveContainer>
                </Chart>
              </ChartContainer>

              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Planned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Actual</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]">
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Overall Completion",
                          planned: projectData.overallCompletion.planned,
                          actual: projectData.overallCompletion.actual,
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      <Legend />
                      <Bar dataKey="planned" name="Planned" fill="#3b82f6" />
                      <Bar dataKey="actual" name="Actual" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </Chart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Planned vs Actual (Stagewise) */}
          <Card>
            <CardHeader>
              <CardTitle>Planned Vs Actual (Stagewise)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]">
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectData.stageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      <Legend />
                      <Bar dataKey="planned" name="Planned" fill="#3b82f6" />
                      <Bar dataKey="actual" name="Actual" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </Chart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Planned vs Actual (Towerwise) */}
          <Card>
            <CardHeader>
              <CardTitle>Planned Vs Actual (Towerwise)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]">
                <Chart>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectData.areaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      <Legend />
                      <Bar dataKey="planned" name="Planned" fill="#3b82f6" />
                      <Bar dataKey="actual" name="Actual" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </Chart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
