"use client"

import type { FC } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const ProjectTabs: FC<ProjectTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-2">
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
