"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-provider"
import { AppHeader } from "@/components/app-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar, Plus } from "lucide-react"
import type { Project } from "@/types/project"
import "ol/ol.css"

export default function MapPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, "projects")
        const projectsSnapshot = await getDocs(projectsRef)

        const projectsList: Project[] = []
        projectsSnapshot.forEach((doc) => {
          projectsList.push({ id: doc.id, ...doc.data() } as Project)
        })

        setProjects(projectsList)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user, router])

  useEffect(() => {
    if (loading || !mapRef.current) return

    // Dynamically import OpenLayers to avoid SSR issues
    const initMap = async () => {
      const { Map, View } = await import("ol")
      const { Tile: TileLayer } = await import("ol/layer")
      const { OSM } = await import("ol/source")
      const { fromLonLat } = await import("ol/proj")
      const { Vector: VectorLayer } = await import("ol/layer")
      const { Vector: VectorSource } = await import("ol/source")
      const { Feature } = await import("ol")
      const { Point } = await import("ol/geom")
      const { Style, Icon } = await import("ol/style")

      // Create map if it doesn't exist
      if (!mapInstanceRef.current) {
        // Base map
        const map = new Map({
          target: mapRef.current,
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
          ],
          view: new View({
            center: fromLonLat([78.9629, 20.5937]), // Center on India
            zoom: 5,
          }),
        })

        mapInstanceRef.current = map
      }

      // Add project markers
      const features = projects.map((project) => {
        // Use project's location or fallback to a default
        const coords = project.location
          ? [project.location.longitude, project.location.latitude]
          : [78.9629 + (Math.random() * 10 - 5), 20.5937 + (Math.random() * 10 - 5)] // Random location in India for demo

        const feature = new Feature({
          geometry: new Point(fromLonLat(coords)),
          project: project,
        })

        feature.setStyle(
          new Style({
            image: new Icon({
              src: "/marker.png",
              scale: 1.2,
              anchor: [0.5, 1],
            }),
          }),
        )

        return feature
      })

      // Create vector layer for markers
      const vectorSource = new VectorSource({
        features: features,
      })

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      })

      // Remove any existing vector layers
      mapInstanceRef.current
        .getLayers()
        .getArray()
        .filter((layer) => layer instanceof VectorLayer)
        .forEach((layer) => mapInstanceRef.current.removeLayer(layer))

      // Add the new vector layer
      mapInstanceRef.current.addLayer(vectorLayer)

      // Add click interaction
      const { Select } = await import("ol/interaction")
      const { click } = await import("ol/events/condition")

      const selectInteraction = new Select({
        condition: click,
        style: new Style({
          image: new Icon({
            src: "/marker-selected.png",
            scale: 1.5,
            anchor: [0.5, 1],
          }),
        }),
      })

      // Remove existing select interactions
      mapInstanceRef.current
        .getInteractions()
        .getArray()
        .filter((interaction) => interaction instanceof Select)
        .forEach((interaction) => mapInstanceRef.current.removeInteraction(interaction))

      mapInstanceRef.current.addInteraction(selectInteraction)

      selectInteraction.on("select", (e) => {
        if (e.selected.length > 0) {
          const project = e.selected[0].get("project")
          if (project && project.id) {
            router.push(`/projects/${project.id}`)
          }
        }
      })
    }

    initMap()

    return () => {
      // Clean up map on component unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined)
        mapInstanceRef.current = null
      }
    }
  }, [loading, projects, router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />

      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Select Date Range</span>
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        ) : (
          <div ref={mapRef} className="absolute inset-0"></div>
        )}
      </div>
    </div>
  )
}
