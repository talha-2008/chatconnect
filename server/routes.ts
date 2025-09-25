import type { Express } from "express"
import { createServer, type Server } from "http"
import { WebSocketServer, WebSocket } from "ws"
import { setupAuth } from "./auth"
import { storage } from "./storage"
import { insertMessageSchema, insertCallSchema } from "@shared/schema"

interface SocketData {
  userId?: string
  username?: string
}

export function registerRoutes(app: Express): Server {
  setupAuth(app)

  // Get contacts for current user (all other users)
  app.get("/api/contacts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401)

    try {
      const currentUserId = req.user!.id

      // Get all users except the current user
      const allUsers = await storage.getAllUsers()
      const contacts = allUsers
        .filter((user) => user.id !== currentUserId)
        .map((user) => ({
          id: user.id,
          username: user.username,
          avatar: user.avatar || undefined,
          status: user.status || "offline",
          lastMessage: "Start a conversation",
          lastMessageTime: "Now",
        }))

      res.json(contacts)
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
      res.status(500).json({ error: "Failed to fetch contacts" })
    }
  })

  // Get chat between two users
  app.get("/api/chats/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401)

    try {
      const { userId } = req.params
      const currentUserId = req.user!.id

      let chat = await storage.getChatBetweenUsers(currentUserId, userId)

      if (!chat) {
        chat = await storage.createChat({
          user1Id: currentUserId,
          user2Id: userId,
        })
      }

      const messages = await storage.getMessagesForChat(chat.id)
      res.json({ chat, messages })
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat" })
    }
  })

  // Get messages for a chat
  app.get("/api/messages/:chatId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401)

    try {
      const { chatId } = req.params
      const messages = await storage.getMessagesForChat(chatId)
      res.json(messages)
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" })
    }
  })

  // Send message
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401)

    try {
      const messageData = insertMessageSchema.parse(req.body)
      messageData.senderId = req.user!.id

      const message = await storage.createMessage(messageData)
      res.json(message)
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" })
    }
  })

  // Initiate call
  app.post("/api/calls", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401)

    try {
      const callData = insertCallSchema.parse(req.body)
      callData.callerId = req.user!.id

      const call = await storage.createCall(callData)
      res.json(call)
    } catch (error) {
      res.status(400).json({ error: "Invalid call data" })
    }
  })

  // Update call status
  app.patch("/api/calls/:callId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401)

    try {
      const { callId } = req.params
      const updates = req.body

      await storage.updateCall(callId, updates)
      res.json({ success: true })
    } catch (error) {
      res.status(400).json({ error: "Failed to update call" })
    }
  })

  app.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401)

    try {
      const { q } = req.query
      const currentUserId = req.user!.id

      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query required" })
      }

      const users = await storage.searchUsers(q.toString(), currentUserId)
      const searchResults = users.map((user) => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar || undefined,
        status: user.status || "offline",
      }))

      res.json(searchResults)
    } catch (error) {
      console.error("Failed to search users:", error)
      res.status(500).json({ error: "Failed to search users" })
    }
  })

  const httpServer = createServer(app)

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" })

  const connectedUsers = new Map<string, WebSocket & { socketData: SocketData }>()

  wss.on("connection", (ws: WebSocket & { socketData: SocketData }) => {
    ws.socketData = {}

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString())

        switch (message.type) {
          case "auth":
            ws.socketData.userId = message.userId
            ws.socketData.username = message.username
            connectedUsers.set(message.userId, ws)

            // Update user status to online
            await storage.updateUserStatus(message.userId, "online")
            break

          case "message":
            // Save message to storage
            const savedMessage = await storage.createMessage({
              chatId: message.chatId,
              senderId: ws.socketData.userId!,
              content: message.content,
              messageType: message.messageType || "text",
            })

            // Send to recipient if online
            const recipientWs = connectedUsers.get(message.recipientId)
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(
                JSON.stringify({
                  type: "message",
                  message: savedMessage,
                }),
              )
            }

            // Confirm to sender
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "message_sent",
                  message: savedMessage,
                }),
              )
            }
            break

          case "call_offer":
          case "call_answer":
          case "ice_candidate":
          case "call_end":
            // Forward WebRTC signaling messages
            const targetWs = connectedUsers.get(message.targetUserId)
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(
                JSON.stringify({
                  ...message,
                  fromUserId: ws.socketData.userId,
                }),
              )
            }
            break
        }
      } catch (error) {
        console.error("WebSocket message error:", error)
      }
    })

    ws.on("close", async () => {
      if (ws.socketData.userId) {
        connectedUsers.delete(ws.socketData.userId)
        await storage.updateUserStatus(ws.socketData.userId, "offline")
      }
    })
  })

  return httpServer
}
