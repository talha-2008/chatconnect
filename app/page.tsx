"use client"

import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    // Redirect to the client app
    window.location.href = "/client/index.html"
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ChatConnect</h1>
        <p className="text-muted-foreground mb-4">Redirecting to the app...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}
