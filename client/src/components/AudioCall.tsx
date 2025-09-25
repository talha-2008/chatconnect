"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Phone, MessageCircle, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import LiveChat from "@/components/LiveChat"
import { useWebRTC } from "@/hooks/use-webrtc"

interface AudioCallProps {
  contactId?: string
  contact?: any
  onEndCall: () => void
}

export default function AudioCall({ contactId, contact, onEndCall }: AudioCallProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [chatVisible, setChatVisible] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)

  const { localStream, remoteStream, isConnected, startCall, endCall, toggleMic } = useWebRTC(contactId, true) // audioOnly = true

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  useEffect(() => {
    if (contactId) {
      startCall()
    }

    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      endCall()
    }
  }, [contactId, startCall, endCall])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleToggleMic = () => {
    setIsMuted(!isMuted)
    toggleMic()
  }

  const handleEndCall = () => {
    endCall()
    onEndCall()
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative flex items-center justify-center">
      {/* Hidden audio element for remote stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Main call interface */}
      <div className="text-center text-white max-w-md mx-auto">
        {/* Contact avatar and info */}
        <div className="mb-8">
          <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
            {contact?.avatar ? (
              <img
                src={contact.avatar || "/placeholder.svg"}
                alt={contact.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="text-6xl font-bold text-white">{contact?.username?.charAt(0)?.toUpperCase() || "?"}</div>
            )}
          </div>

          <h2 className="text-3xl font-semibold mb-2">{contact?.username || "Connecting..."}</h2>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Volume2 size={20} className="text-white/80" />
            <p className="text-xl text-white/80">{isConnected ? "Connected" : "Calling..."}</p>
          </div>

          <p className="text-lg text-white/60">{formatDuration(callDuration)}</p>
        </div>

        {/* Audio visualization */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-white/60 rounded-full transition-all duration-300 ${
                  isConnected && !isMuted ? `h-${4 + (i % 3) * 2} animate-pulse` : "h-2"
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Call controls */}
        <div className="flex items-center justify-center gap-6">
          <Button
            size="lg"
            variant="ghost"
            onClick={handleToggleMic}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/20 backdrop-blur-sm hover:bg-white/30"
            }`}
            data-testid="button-toggle-mic"
          >
            {isMuted ? <MicOff className="text-white" size={24} /> : <Mic className="text-white" size={24} />}
          </Button>

          <Button
            size="lg"
            onClick={handleEndCall}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            data-testid="button-end-call"
          >
            <Phone className="text-white" size={28} />
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={() => setChatVisible(!chatVisible)}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            data-testid="button-toggle-chat"
          >
            <MessageCircle className="text-white" size={24} />
          </Button>
        </div>
      </div>

      {/* Chat panel */}
      <div
        className={`absolute top-0 right-0 w-80 h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          chatVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <LiveChat contactId={contactId} onClose={() => setChatVisible(false)} />
      </div>

      {/* Mobile chat overlay */}
      {chatVisible && (
        <div className="md:hidden absolute inset-0 bg-white z-50">
          <LiveChat contactId={contactId} onClose={() => setChatVisible(false)} />
        </div>
      )}
    </div>
  )
}
