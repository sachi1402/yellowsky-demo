import type { FC } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Project } from "@/types/project"
import { MapPin } from "lucide-react"

interface ProjectCardProps {
  project: Project
}

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={project.thumbnail || "/placeholder.svg?height=160&width=320"}
            alt={project.name}
            className="h-full w-full object-cover"
            width={320}
            height={160}
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium">{project.name}</h3>
          <div className="mt-1 flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-3 w-3" />
            <span>{project.location?.name || "Location not specified"}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Orders: {project.orders || 0}</p>
              <p className="text-muted-foreground">
                Last Order: {project.lastOrder ? new Date(project.lastOrder).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <p className="font-medium">{project.maps || 0}</p>
              <p className="text-muted-foreground">Maps</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{project.images || 0}</p>
              <p className="text-muted-foreground">Images</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{project.panos || 0}</p>
              <p className="text-muted-foreground">Panos</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{project.videos || 0}</p>
              <p className="text-muted-foreground">Videos</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
