"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useSocket } from "./use-socket"

export function useWebRTC(contactId?: string, audioOnly = false) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)

  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const { sendSignal, onMessage } = useSocket()

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    })

    pc.onicecandidate = (event) => {
      if (event.candidate && contactId) {
        sendSignal("ice_candidate", {
          targetUserId: contactId,
          candidate: event.candidate,
        })
      }
    }

    pc.ontrack = (event) => {
      console.log("Received remote stream")
      setRemoteStream(event.streams[0])
      setIsConnected(true)
    }

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState)
      if (pc.connectionState === "connected") {
        setIsConnected(true)
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setIsConnected(false)
      }
    }

    return pc
  }, [contactId, sendSignal])

  const startCall = useCallback(async () => {
    if (!contactId) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !audioOnly,
        audio: true,
      })

      setLocalStream(stream)

      // Create peer connection
      const pc = createPeerConnection()
      peerConnection.current = pc

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      // Create and send offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      sendSignal("call_offer", {
        targetUserId: contactId,
        offer: offer,
        audioOnly: audioOnly,
      })
    } catch (error) {
      console.error("Error starting call:", error)
    }
  }, [contactId, createPeerConnection, sendSignal, audioOnly])

  const answerCall = useCallback(
    async (offer: RTCSessionDescriptionInit, isAudioOnly = false) => {
      if (!contactId) return

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: !isAudioOnly,
          audio: true,
        })

        setLocalStream(stream)

        // Create peer connection
        const pc = createPeerConnection()
        peerConnection.current = pc

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream)
        })

        // Set remote description and create answer
        await pc.setRemoteDescription(offer)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        sendSignal("call_answer", {
          targetUserId: contactId,
          answer: answer,
        })
      } catch (error) {
        console.error("Error answering call:", error)
      }
    },
    [contactId, createPeerConnection, sendSignal],
  )

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    setRemoteStream(null)
    setIsConnected(false)

    if (contactId) {
      sendSignal("call_end", {
        targetUserId: contactId,
      })
    }
  }, [localStream, contactId, sendSignal])

  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }, [localStream])

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setCameraOn(videoTrack.enabled)
      }
    }
  }, [localStream])

  // Set up WebSocket message handlers
  useEffect(() => {
    const cleanup = [
      onMessage("call_offer", async (data) => {
        await answerCall(data.offer, data.audioOnly)
      }),

      onMessage("call_answer", async (data) => {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(data.answer)
        }
      }),

      onMessage("ice_candidate", async (data) => {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(data.candidate)
        }
      }),

      onMessage("call_end", () => {
        endCall()
      }),
    ]

    return () => {
      cleanup.forEach((fn) => fn())
    }
  }, [onMessage, answerCall, endCall])

  return {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    cameraOn,
    startCall,
    endCall,
    toggleMic,
    toggleCamera,
    audioOnly,
  }
}
