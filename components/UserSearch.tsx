"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface SearchUser {
  id: string
  username: string
  avatar?: string
  status: string
}

interface UserSearchProps {
  onUserSelect: (user: SearchUser) => void
}

export default function UserSearch({ onUserSelect }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const { data: searchResults = [], isLoading } = useQuery<SearchUser[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return []

      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error("Failed to search users")
      return response.json()
    },
    enabled: searchQuery.trim().length > 0,
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setIsSearching(value.trim().length > 0)
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-muted border-0 focus:ring-2 focus:ring-ring"
          data-testid="input-search-users"
        />
      </div>

      {isSearching && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">Search Results</h5>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                {searchQuery.trim() ? "No users found" : "Start typing to search users"}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  data-testid={`search-result-${user.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback className="text-xs">{getInitials(user.username)}</AvatarFallback>
                      </Avatar>
                      {user.status === "online" && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUserSelect(user)}
                    className="h-8 w-8 p-0"
                    data-testid={`connect-user-${user.id}`}
                  >
                    <UserPlus size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
