export interface Project {
  id: string
  name: string
  description?: string
  thumbnail?: string
  location?: {
    name: string
    latitude: number
    longitude: number
  }
  orders?: number
  lastOrder?: string
  maps?: number
  images?: number
  videos?: number
  panos?: number
  virtualTours?: number
  createdAt: string
  updatedAt: string
}
