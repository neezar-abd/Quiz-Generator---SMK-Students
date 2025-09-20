import { auth } from "@/lib/auth"

export async function getAuthSession() {
  try {
    const session = await auth()
    return session
  } catch (error) {
    console.error("Error getting auth session:", error)
    return null
  }
}

export async function requireAuth() {
  try {
    const session = await getAuthSession()
    
    if (!session?.user?.id) {
      throw new Error("Unauthorized - Please login first")
    }
    
    return {
      user: session.user,
      userId: session.user.id
    }
  } catch (error) {
    console.error("Auth error:", error);
    throw new Error("Authentication failed")
  }
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ 
      error: "Unauthorized", 
      message: "Please login to access this resource" 
    }),
    { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    }
  )
}