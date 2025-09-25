import type { User, InsertUser, Chat, InsertChat, Message, InsertMessage, Call, InsertCall } from "@shared/schema"
import { randomUUID } from "crypto"
import session from "express-session"
import createMemoryStore from "memorystore"

const MemoryStore = createMemoryStore(session)

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>
  updateUserStatus(id: string, status: string): Promise<void>
  getAllUsers(): Promise<User[]>
  searchUsers(query: string, excludeUserId: string): Promise<User[]>

  // Chat methods
  getChatsForUser(userId: string): Promise<Chat[]>
  getChatBetweenUsers(user1Id: string, user2Id: string): Promise<Chat | undefined>
  createChat(chat: InsertChat): Promise<Chat>

  // Message methods
  getMessagesForChat(chatId: string): Promise<Message[]>
  createMessage(message: InsertMessage): Promise<Message>
  markMessageAsRead(messageId: string): Promise<void>

  // Call methods
  createCall(call: InsertCall): Promise<Call>
  updateCall(id: string, updates: Partial<Call>): Promise<void>
  getCallHistory(userId: string): Promise<Call[]>

  // Session store
  sessionStore: session.Store
}

export class MemStorage implements IStorage {
  private users: Map<string, User>
  private chats: Map<string, Chat>
  private messages: Map<string, Message>
  private calls: Map<string, Call>
  public sessionStore: session.Store

  constructor() {
    this.users = new Map()
    this.chats = new Map()
    this.messages = new Map()
    this.calls = new Map()
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    })
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id)
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username)
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID()
    const user: User = {
      ...insertUser,
      id,
      avatar: null,
      status: "offline",
      lastSeen: new Date(),
    }
    this.users.set(id, user)
    return user
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    const user = this.users.get(id)
    if (user) {
      user.status = status
      user.lastSeen = new Date()
      this.users.set(id, user)
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  async searchUsers(query: string, excludeUserId: string): Promise<User[]> {
    const searchTerm = query.toLowerCase()
    return Array.from(this.users.values()).filter(
      (user) => user.id !== excludeUserId && user.username.toLowerCase().includes(searchTerm),
    )
  }

  async getChatsForUser(userId: string): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter((chat) => chat.user1Id === userId || chat.user2Id === userId)
  }

  async getChatBetweenUsers(user1Id: string, user2Id: string): Promise<Chat | undefined> {
    return Array.from(this.chats.values()).find(
      (chat) =>
        (chat.user1Id === user1Id && chat.user2Id === user2Id) ||
        (chat.user1Id === user2Id && chat.user2Id === user1Id),
    )
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = randomUUID()
    const chat: Chat = {
      ...insertChat,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.chats.set(id, chat)
    return chat
  }

  async getMessagesForChat(chatId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.chatId === chatId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID()
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      isRead: false,
      messageType: insertMessage.messageType || "text",
    }
    this.messages.set(id, message)

    // Update chat's updatedAt
    const chat = this.chats.get(insertMessage.chatId)
    if (chat) {
      chat.updatedAt = new Date()
      this.chats.set(insertMessage.chatId, chat)
    }

    return message
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId)
    if (message) {
      message.isRead = true
      this.messages.set(messageId, message)
    }
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = randomUUID()
    const call: Call = {
      ...insertCall,
      id,
      startTime: new Date(),
      endTime: null,
      duration: null,
    }
    this.calls.set(id, call)
    return call
  }

  async updateCall(id: string, updates: Partial<Call>): Promise<void> {
    const call = this.calls.get(id)
    if (call) {
      Object.assign(call, updates)
      this.calls.set(id, call)
    }
  }

  async getCallHistory(userId: string): Promise<Call[]> {
    return Array.from(this.calls.values())
      .filter((call) => call.callerId === userId || call.receiverId === userId)
      .sort((a, b) => b.startTime!.getTime() - a.startTime!.getTime())
  }
}

export const storage = new MemStorage()
