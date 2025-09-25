"use client"

import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    // Redirect to the client app
    window.location.href = "/client/index.html"
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ChatConnect
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">Connecting you to seamless communication...</p>
        <div className="flex items-center justify-center space-x-1">
          <div className="animate-bounce w-2 h-2 bg-primary rounded-full"></div>
          <div className="animate-bounce w-2 h-2 bg-primary rounded-full" style={{ animationDelay: "0.1s" }}></div>
          <div className="animate-bounce w-2 h-2 bg-primary rounded-full" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}
