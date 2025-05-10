import { cookies } from "next/headers"

export async function getAuthStatus() {
  const cookieStore = cookies()
  const session = cookieStore.get("session")

  // In a real app, you'd verify the session token
  // For demo purposes, we'll just check if it exists
  return !!session
}
