export interface MediaItem {
  id: string
  projectId: string
  type: "image" | "video" | "pano" | "map"
  name: string
  url: string
  thumbnail?: string
  size: number
  createdAt: string
  updatedAt?: string
  metadata: {
    contentType: string
    dimensions?: {
      width: number
      height: number
    }
    duration?: number
  }
}
