"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Video, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import UserSearch from "@/components/UserSearch"

interface Contact {
  id: string
  username: string
  avatar?: string
  status: string
  lastMessage: string
  lastMessageTime: string
}

interface ChatListProps {
  onContactSelect: (contact: Contact) => void
  onStartCall?: (contactId: string, callType: "video" | "audio") => void
}

export default function ChatList({ onContactSelect, onStartCall }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  })

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleUserSelect = (user: any) => {
    // Convert search result to contact format and select
    const contact: Contact = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      status: user.status,
      lastMessage: "Start a conversation",
      lastMessageTime: "Now",
    }
    onContactSelect(contact)
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-20"></div>
          <div className="h-12 bg-muted rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-48"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs defaultValue="chats" className="h-full flex flex-col">
        <div className="p-4 pb-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chats" data-testid="tab-chats">
              Chats
            </TabsTrigger>
            <TabsTrigger value="search" data-testid="tab-search">
              Find Users
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chats" className="flex-1 overflow-hidden mt-0">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-0 focus:ring-2 focus:ring-ring"
                data-testid="input-search-contacts"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-contacts">
                {contacts.length === 0 ? "No contacts yet. Search for users to start chatting!" : "No contacts found"}
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center p-4 hover:bg-muted cursor-pointer transition-colors border-b border-border/50 group"
                  data-testid={`contact-item-${contact.id}`}
                >
                  <div className="relative" onClick={() => onContactSelect(contact)}>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.username} />
                      <AvatarFallback>{getInitials(contact.username)}</AvatarFallback>
                    </Avatar>
                    {contact.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 status-online rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-4 flex-1" onClick={() => onContactSelect(contact)}>
                    <div className="flex justify-between items-start">
                      <h5 className="font-semibold text-foreground" data-testid={`text-contact-name-${contact.id}`}>
                        {contact.username}
                      </h5>
                      <span className="text-xs text-muted-foreground" data-testid={`text-contact-time-${contact.id}`}>
                        {contact.lastMessageTime}
                      </span>
                    </div>
                    <p
                      className="text-sm text-muted-foreground truncate"
                      data-testid={`text-contact-message-${contact.id}`}
                    >
                      {contact.lastMessage}
                    </p>
                  </div>

                  {onStartCall && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartCall(contact.id, "audio")
                        }}
                        className="w-8 h-8 p-0 hover:bg-blue-100"
                        data-testid={`button-audio-call-${contact.id}`}
                      >
                        <Phone size={16} className="text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartCall(contact.id, "video")
                        }}
                        className="w-8 h-8 p-0 hover:bg-green-100"
                        data-testid={`button-video-call-${contact.id}`}
                      >
                        <Video size={16} className="text-green-600" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="search" className="flex-1 overflow-hidden mt-0">
          <UserSearch onUserSelect={handleUserSelect} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
