import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveChat from "@/components/LiveChat";
import { useWebRTC } from "@/hooks/use-webrtc";

interface VideoCallProps {
  contactId?: string;
  contact?: any;
  onEndCall: () => void;
}

export default function VideoCall({ contactId, contact, onEndCall }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [chatVisible, setChatVisible] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
    localStream,
    remoteStream,
    isConnected,
    startCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useWebRTC(contactId);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (contactId) {
      startCall();
    }
    
    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      endCall();
    };
  }, [contactId, startCall, endCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMic = () => {
    setIsMuted(!isMuted);
    toggleMic();
  };

  const handleToggleCamera = () => {
    setCameraOn(!cameraOn);
    toggleCamera();
  };

  const handleEndCall = () => {
    endCall();
    onEndCall();
  };

  return (
    <div className="h-screen bg-gray-900 relative">
      {/* Remote video */}
      <div className="absolute inset-0 video-container">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            data-testid="video-remote"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <VideoIcon size={48} />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                {contact?.username || "Connecting..."}
              </h3>
              <p className="text-white/80">
                {isConnected ? "Connected" : "Waiting for connection..."}
              </p>
            </div>
          </div>
        )}
        
        {/* Call header */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <h3 className="text-white font-semibold" data-testid="text-participant-name">
            {contact?.username || "Unknown"}
          </h3>
          <p className="text-white/80 text-sm" data-testid="text-call-duration">
            {formatDuration(callDuration)}
          </p>
        </div>
      </div>

      {/* Self video */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
        {cameraOn && localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            data-testid="video-self"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-700">
            <VideoOff className="text-white" size={32} />
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <Button
          size="lg"
          variant="ghost"
          onClick={handleToggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? 'bg-destructive hover:bg-red-600' : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
          }`}
          data-testid="button-toggle-mic"
        >
          {isMuted ? (
            <MicOff className="text-white" size={20} />
          ) : (
            <Mic className="text-white" size={20} />
          )}
        </Button>
        
        <Button
          size="lg"
          onClick={handleEndCall}
          className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          data-testid="button-end-call"
        >
          <Phone className="text-white" size={20} />
        </Button>
        
        <Button
          size="lg"
          variant="ghost"
          onClick={handleToggleCamera}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            !cameraOn ? 'bg-destructive hover:bg-red-600' : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
          }`}
          data-testid="button-toggle-camera"
        >
          {cameraOn ? (
            <VideoIcon className="text-white" size={20} />
          ) : (
            <VideoOff className="text-white" size={20} />
          )}
        </Button>
      </div>

      {/* Live chat panel - Desktop */}
      <div className={`absolute top-0 right-0 w-80 h-full bg-white shadow-2xl hidden lg:flex flex-col transition-transform duration-300 ${
        chatVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <LiveChat contactId={contactId} onClose={() => setChatVisible(false)} />
      </div>

      {/* Mobile chat toggle */}
      <Button
        className="lg:hidden absolute top-4 right-4 w-12 h-12 bg-whatsapp-primary rounded-full flex items-center justify-center shadow-lg"
        onClick={() => setChatVisible(!chatVisible)}
        data-testid="button-toggle-mobile-chat"
      >
        <MessageCircle className="text-white" size={20} />
      </Button>

      {/* Mobile chat overlay */}
      {chatVisible && (
        <div className="lg:hidden absolute inset-0 bg-white z-50">
          <LiveChat contactId={contactId} onClose={() => setChatVisible(false)} />
        </div>
      )}
    </div>
  );
}
