import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./use-auth";

interface SocketMessage {
  type: string;
  [key: string]: any;
}

interface MessageData {
  chatId: string;
  recipientId: string;
  content: string;
  messageType: string;
}

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  const connect = useCallback(() => {
    if (!user || socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connected");
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
        username: user.username,
      }));
    };
    
    socket.onmessage = (event) => {
      try {
        const message: SocketMessage = JSON.parse(event.data);
        const handler = messageHandlers.current.get(message.type);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
    
    socket.onclose = () => {
      console.log("WebSocket disconnected");
      socketRef.current = null;
      // Attempt to reconnect after a delay
      setTimeout(connect, 3000);
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    socketRef.current = socket;
  }, [user]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((data: MessageData) => {
    console.log('Attempting to send message:', data, 'Connection state:', socketRef.current?.readyState);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        ...data,
      }));
      console.log('Message sent successfully');
    } else {
      console.log('WebSocket not ready, state:', socketRef.current?.readyState);
    }
  }, []);

  const sendSignal = useCallback((type: string, data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type,
        ...data,
      }));
    }
  }, []);

  const onMessage = useCallback((messageType: string, handler: (data: any) => void) => {
    messageHandlers.current.set(messageType, handler);
    
    return () => {
      messageHandlers.current.delete(messageType);
    };
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  return {
    sendMessage,
    sendSignal,
    onMessage,
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
  };
}
