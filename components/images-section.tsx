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
import { Upload, Search, MoreVertical, Edit, Trash, Download, Share2, Eye } from "lucide-react"
import type { MediaItem } from "@/types/media"

interface ImagesSectionProps {
  projectId: string
}

export const ImagesSection: FC<ImagesSectionProps> = ({ projectId }) => {
  const [images, setImages] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesRef = collection(db, "media")
        const q = query(imagesRef, where("projectId", "==", projectId), where("type", "==", "image"))

        const querySnapshot = await getDocs(q)
        const imagesList: MediaItem[] = []

        querySnapshot.forEach((doc) => {
          imagesList.push({ id: doc.id, ...doc.data() } as MediaItem)
        })

        setImages(imagesList)
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [projectId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const file = files[0]
      const storageRef = ref(storage, `projects/${projectId}/images/${Date.now()}_${file.name}`)

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
          const newImage: Partial<MediaItem> = {
            projectId,
            type: "image",
            url: downloadURL,
            name: file.name,
            size: file.size,
            createdAt: new Date().toISOString(),
            metadata: {
              contentType: file.type,
              dimensions: { width: 0, height: 0 }, // You'd need to get actual dimensions
            },
          }

          // In a real app, you'd add this to Firestore
          // For demo, we'll just add it to the local state
          setImages((prev) => [{ id: `temp-${Date.now()}`, ...newImage } as MediaItem, ...prev])

          setUploading(false)
          setUploadProgress(0)
        },
      )
    } catch (error) {
      console.error("Error handling file upload:", error)
      setUploading(false)
    }
  }

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  const filteredImages = searchQuery
    ? images.filter((image) => image.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : images

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for images..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </div>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[200px] rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No images found</h3>
              <p className="text-muted-foreground mt-1">Upload images or adjust your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative group">
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedImages.includes(image.id)}
                        onCheckedChange={() => toggleImageSelection(image.id)}
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

                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.url || "/placeholder.svg?height=200&width=200"}
                        alt={image.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(image.createdAt).toLocaleDateString()}</p>
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
