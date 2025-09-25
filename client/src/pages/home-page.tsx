"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Header from "@/components/Header"
import ChatList from "@/components/ChatList"
import VideoCall from "@/components/VideoCall"
import AudioCall from "@/components/AudioCall"
import { useIsMobile } from "@/hooks/use-mobile"
import { Video, Phone, Users, MessageCircle } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [currentView, setCurrentView] = useState<"chat" | "video-call" | "audio-call">("chat")
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [activeCall, setActiveCall] = useState<string | null>(null)

  const handleStartCall = (contactId?: string, callType: "video" | "audio" = "video") => {
    if (contactId) {
      setSelectedContact({ id: contactId })
    }
    setActiveCall(contactId || "new")
    setCurrentView(callType === "video" ? "video-call" : "audio-call")
  }

  const handleEndCall = () => {
    setActiveCall(null)
    setCurrentView("chat")
  }

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact)
    if (isMobile) {
      // On mobile, selecting a contact could start a call
      handleStartCall(contact.id, "video")
    }
  }

  if (currentView === "video-call") {
    return (
      <VideoCall
        contactId={activeCall === "new" ? undefined : activeCall!}
        contact={selectedContact}
        onEndCall={handleEndCall}
      />
    )
  }

  if (currentView === "audio-call") {
    return (
      <AudioCall
        contactId={activeCall === "new" ? undefined : activeCall!}
        contact={selectedContact}
        onEndCall={handleEndCall}
      />
    )
  }

  return (
    <div className="min-h-screen bg-whatsapp-bg">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white border-r border-border flex flex-col">
          <Header onStartCall={() => handleStartCall()} />

          {/* Welcome Section */}
          <div className="bg-whatsapp-primary text-white p-6">
            <h2 className="text-2xl font-semibold mb-2">Hello {user?.username}!</h2>
            <h3 className="text-xl mb-4">Ready to Connect?</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleStartCall(undefined, "video")}
                  className="flex-1 bg-white text-whatsapp-primary px-4 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2"
                  data-testid="button-start-video-call"
                >
                  <Video size={18} />
                  Video
                </button>
                <button
                  onClick={() => handleStartCall(undefined, "audio")}
                  className="flex-1 bg-white/90 text-whatsapp-primary px-4 py-3 rounded-xl font-semibold hover:bg-white transition-colors shadow-lg flex items-center justify-center gap-2"
                  data-testid="button-start-audio-call"
                >
                  <Phone size={18} />
                  Audio
                </button>
              </div>
              <p className="text-sm text-white/80 text-center">Search for users to start chatting and calling</p>
            </div>
          </div>

          <ChatList onContactSelect={handleContactSelect} />
        </div>

        {/* Main Content - Desktop only */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 bg-whatsapp-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="text-white" size={48} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">ChatConnect</h2>
            <p className="text-muted-foreground mb-6">
              Connect with friends through video calls, audio calls, and chat. Search for users by username to start
              conversations.
            </p>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <Users className="text-whatsapp-primary" size={24} />
                <div className="text-left">
                  <h4 className="font-semibold text-sm">Find Users</h4>
                  <p className="text-xs text-muted-foreground">Search by username to connect</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <MessageCircle className="text-whatsapp-primary" size={24} />
                <div className="text-left">
                  <h4 className="font-semibold text-sm">Chat & Call</h4>
                  <p className="text-xs text-muted-foreground">Real-time messaging, video and audio calls</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleStartCall(undefined, "video")}
                className="bg-whatsapp-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-whatsapp-dark transition-colors flex items-center gap-2"
                data-testid="button-start-new-video-call"
              >
                <Video size={20} />
                Video Call
              </button>
              <button
                onClick={() => handleStartCall(undefined, "audio")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                data-testid="button-start-new-audio-call"
              >
                <Phone size={20} />
                Audio Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
