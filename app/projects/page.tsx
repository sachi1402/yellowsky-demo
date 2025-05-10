"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-provider"
import { ProjectCard } from "@/components/project-card"
import { AppHeader } from "@/components/app-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import type { Project } from "@/types/project"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
alert('hii')
    const fetchProjects = async () => {
      
      try {
        
        const projectsRef = collection(db, "projects")
        
        const projectsSnapshot = await getDocs(projectsRef)
        
        const projectsList: Project[] = []
        console.log(projectsSnapshot)
        alert('hii')
        projectsSnapshot.forEach((doc) => {
          projectsList.push({ id: doc.id, ...doc.data() } as Project)
        })
       
        setProjects(projectsList)
        setFilteredProjects(projectsList)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user, router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects)
    } else {
      const filtered = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredProjects(filtered)
    }
  }, [searchQuery, projects])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect above
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center w-full max-w-md">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <Button onClick={() => router.push("/projects/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[200px] rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
          {JSON.stringify(projects)}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your search or create a new project</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
