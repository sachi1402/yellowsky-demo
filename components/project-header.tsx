"use client"

import type { FC } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types/project"

interface ProjectHeaderProps {
  project: Project
}

export const ProjectHeader: FC<ProjectHeaderProps> = ({ project }) => {
  const router = useRouter()

  return (
    <div className="mb-6">
      <Button variant="ghost" className="flex items-center gap-2 mb-2" onClick={() => router.push("/projects")}>
        <ChevronLeft className="h-4 w-4" />
        <span>All Projects</span>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.location?.name || "Location not specified"}</p>
        </div>

        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button variant="outline">View All Orders</Button>
          <Button>New Order</Button>
        </div>
      </div>
    </div>
  )
}
