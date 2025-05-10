"use client"

import type React from "react"

import { type FC, useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Upload, Search, MoreVertical, Edit, Trash, Download, Share2, Eye, Play } from "lucide-react"
import type { MediaItem } from "@/types/media"

interface VideosSectionProps {
  projectId: string
}

export const VideosSection: FC<VideosSectionProps> = ({ projectId }) => {
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosRef = collection(db, "media")
        const q = query(videosRef, where("projectId", "==", projectId), where("type", "==", "video"))

        const querySnapshot = await getDocs(q)
        const videosList: MediaItem[] = []

        querySnapshot.forEach((doc) => {
          videosList.push({ id: doc.id, ...doc.data() } as MediaItem)
        })

        setVideos(videosList)
      } catch (error) {
        console.error("Error fetching videos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [projectId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const file = files[0]
      const storageRef = ref(storage, `projects/${projectId}/videos/${Date.now()}_${file.name}`)

      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error("Upload error:", error)
          setUploading(false)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Add to Firestore
          const newVideo: Partial<MediaItem> = {
            projectId,
            type: "video",
            url: downloadURL,
            name: file.name,
            size: file.size,
            createdAt: new Date().toISOString(),
            metadata: {
              contentType: file.type,
              duration: 0, // You'd need to get actual duration
            },
          }

          // In a real app, you'd add this to Firestore
          // For demo, we'll just add it to the local state
          setVideos((prev) => [{ id: `temp-${Date.now()}`, ...newVideo } as MediaItem, ...prev])

          setUploading(false)
          setUploadProgress(0)
        },
      )
    } catch (error) {
      console.error("Error handling file upload:", error)
      setUploading(false)
    }
  }

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) => (prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]))
  }

  const filteredVideos = searchQuery
    ? videos.filter((video) => video.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : videos

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for videos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="video-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <Upload className="h-4 w-4" />
              <span>Upload Video</span>
            </div>
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </Label>
        </div>
      </div>

      {uploading && (
        <div className="mb-6">
          <div className="text-sm mb-2">Uploading... {Math.round(uploadProgress)}%</div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[200px] rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No videos found</h3>
              <p className="text-muted-foreground mt-1">Upload videos or adjust your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="relative group">
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={() => toggleVideoSelection(video.id)}
                      />
                    </div>

                    <div className="absolute top-2 right-2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={video.thumbnail || "/placeholder.svg?height=180&width=320"}
                        alt={video.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{video.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(video.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
