import { redirect } from "next/navigation"
import { getAuthStatus } from "@/lib/auth-utils"

export default async function Home() {
  const isAuthenticated = await getAuthStatus()

  if (isAuthenticated) {
    redirect("/projects")
  } else {
    redirect("/login")
  }
}
