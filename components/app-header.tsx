"use client"

import type { FC } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-provider"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings } from "lucide-react"

export const AppHeader: FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Logo />

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/projects"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/projects" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            All Media
          </Link>
          <Link
            href="/map"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/map" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Map
          </Link>
          <Link
            href="/charts"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/charts" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Analytics
          </Link>
          <Link
            href="/documents"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/documents" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Documents
          </Link>
          <Link
            href="/data"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/data" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Data
          </Link>
          <Link
            href="/share"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/share" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Share
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            CEO Dashboard
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                  <AvatarFallback>{user?.displayName ? getInitials(user.displayName) : "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
