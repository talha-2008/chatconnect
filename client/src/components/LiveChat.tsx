import { useState, useEffect, useRef } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  isRead: boolean;
}

interface LiveChatProps {
  contactId?: string;
  onClose: () => void;
}

export default function LiveChat({ contactId, onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { sendMessage, onMessage, isConnected } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when contact changes
  useEffect(() => {
    if (!contactId || !user) return;

    const loadChatHistory = async () => {
      setIsLoading(true);
      try {
        console.log('Loading chat history for contact:', contactId);
        const response = await fetch(`/api/chats/${contactId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const { messages: chatMessages } = await response.json();
          console.log('Loaded messages:', chatMessages);
          
          const formattedMessages = chatMessages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            createdAt: new Date(msg.createdAt),
            isRead: msg.isRead,
          }));
          
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [contactId, user]);

  useEffect(() => {
    // Listen for incoming messages
    const cleanup = onMessage('message', (data: any) => {
      const message: Message = {
        id: data.message.id,
        content: data.message.content,
        senderId: data.message.senderId,
        createdAt: new Date(data.message.createdAt),
        isRead: data.message.isRead,
      };
      setMessages(prev => [...prev, message]);
    });

    return cleanup;
  }, [onMessage]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) {
      console.log('Cannot send message:', { newMessage: !!newMessage.trim(), user: !!user, contactId, isConnected });
      return;
    }

    // Use a default contactId for testing if none provided
    const targetContactId = contactId || 'demo-contact';

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user.id,
      createdAt: new Date(),
      isRead: false,
    };

    console.log('Sending message:', message);
    setMessages(prev => [...prev, message]);
    
    sendMessage({
      chatId: `${user.id}-${targetContactId}`,
      recipientId: targetContactId,
      content: newMessage,
      messageType: 'text',
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <>
      {/* Chat header */}
      <div className="bg-whatsapp-primary text-white p-4 flex items-center justify-between">
        <h4 className="font-semibold" data-testid="text-live-chat-title">Live Chat</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:text-gray-200 hover:bg-white/10"
          data-testid="button-close-chat"
        >
          <X size={18} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-whatsapp-bg" data-testid="chat-messages-container">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading chat history...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8" data-testid="text-no-messages">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'items-start space-x-2'}`}
                data-testid={`message-${message.id}`}
              >
                {!isOwnMessage && (
                  <div className="w-8 h-8 bg-whatsapp-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">U</span>
                  </div>
                )}
                
                <div
                  className={`p-3 rounded-xl shadow-sm max-w-xs relative ${
                    isOwnMessage
                      ? 'bg-whatsapp-light rounded-tr-sm chat-bubble-tail'
                      : 'bg-white rounded-tl-sm chat-bubble-tail-received'
                  }`}
                >
                  <p className="text-sm text-foreground" data-testid={`message-content-${message.id}`}>
                    {message.content}
                  </p>
                  <span className={`text-xs text-muted-foreground mt-1 block ${isOwnMessage ? 'text-right' : ''}`}>
                    {formatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 bg-white border-t border-border">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-muted border-0 focus:ring-2 focus:ring-ring"
            data-testid="input-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-whatsapp-primary rounded-xl flex items-center justify-center hover:bg-whatsapp-dark transition-colors"
            data-testid="button-send-message"
          >
            <Send className="text-white" size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
