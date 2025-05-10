"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-provider"
import { AppHeader } from "@/components/app-header"
import { ProjectHeader } from "@/components/project-header"
import { ProjectTabs } from "@/components/project-tabs"
import { ImagesSection } from "@/components/images-section"
import { VideosSection } from "@/components/videos-section"
import type { Project } from "@/types/project"

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("images")
  const { user } = useAuth()
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchProject = async () => {
      try {
        const projectRef = doc(db, "projects", id)
        const projectSnap = await getDoc(projectRef)

        if (projectSnap.exists()) {
          setProject({ id: projectSnap.id, ...projectSnap.data() } as Project)
        } else {
          router.push("/projects")
        }
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="h-[400px] bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <button onClick={() => router.push("/projects")} className="text-primary hover:underline">
            Back to projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-6">
        <ProjectHeader project={project} />

        <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6">
          {activeTab === "images" ? <ImagesSection projectId={id} /> : <VideosSection projectId={id} />}
        </div>
      </main>
    </div>
  )
}
