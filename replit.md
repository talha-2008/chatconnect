# Overview

VideoChat is a modern WhatsApp-style video calling and live chat web application built as a fullstack TypeScript application. The system enables users to conduct 1:1 video calls with integrated real-time messaging capabilities. The application features a clean, responsive interface inspired by WhatsApp's design language, with a green and white color scheme. Users can authenticate, view contact lists, initiate video calls, and engage in live chat during calls, with all interactions being saved to the database for history tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript and follows a component-based architecture. The application uses Vite as the build tool and bundler for fast development and optimized production builds. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface elements. Styling is handled through Tailwind CSS with custom CSS variables for theming, enabling consistent design patterns and responsive layouts.

The frontend implements a routing system using Wouter for lightweight client-side navigation. State management is handled through React Query (TanStack Query) for server state management and React hooks for local component state. The application includes protected routes that require authentication, automatically redirecting unauthenticated users to the login page.

## Backend Architecture
The server is built with Express.js and TypeScript, following a RESTful API design pattern. The application uses session-based authentication with Passport.js and the Local Strategy for user login/logout functionality. Password security is implemented using Node.js crypto module with scrypt for hashing and salt generation.

Real-time communication is achieved through WebSocket connections for live chat messaging and WebRTC for peer-to-peer video calling capabilities. The server maintains WebSocket connections for each authenticated user, enabling instant message delivery and call signaling.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database interactions and schema management. The database schema includes tables for users, chats, messages, and calls, supporting the full range of application features. For development and simple deployments, an in-memory storage implementation is provided as a fallback, using Maps to store data temporarily.

Session management is handled through connect-pg-simple for PostgreSQL-backed sessions in production, with a memory store fallback for development environments.

## Authentication and Authorization
Authentication is implemented using Passport.js with the Local Strategy, providing username/password-based login. Sessions are managed server-side with secure session cookies, and all API endpoints include authentication middleware to protect user data. Password hashing uses the scrypt algorithm with random salts for security.

The frontend includes authentication context and hooks for managing user state across components, with automatic redirects for unauthenticated users attempting to access protected routes.

## Real-time Communication
WebRTC is implemented for peer-to-peer video calling, including camera and microphone controls, with STUN servers configured for NAT traversal. The application includes hooks for managing WebRTC connections, handling offer/answer exchanges, and managing ICE candidates.

WebSocket connections handle real-time messaging during calls and general chat functionality. The socket implementation includes user authentication, message broadcasting, and connection management for multiple concurrent users.

# External Dependencies

## Database and Storage
- **PostgreSQL**: Primary database for production deployments, configured through DATABASE_URL environment variable
- **Neon Database**: Serverless PostgreSQL provider integration via @neondatabase/serverless
- **Drizzle ORM**: Type-safe ORM with migration support for database schema management

## UI and Styling
- **shadcn/ui**: Pre-built component library with Radix UI primitives for accessible interface elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design and custom theming
- **Radix UI**: Headless component primitives for complex UI interactions like dialogs, dropdowns, and form controls

## Authentication and Security
- **Passport.js**: Authentication middleware with Local Strategy for username/password login
- **bcrypt**: Password hashing library for secure credential storage
- **express-session**: Session management middleware with PostgreSQL session store support

## Real-time Features
- **WebRTC**: Browser-based peer-to-peer communication for video calling
- **WebSocket (ws)**: Real-time bidirectional communication for live chat messaging
- **STUN servers**: Google's public STUN servers for WebRTC NAT traversal

## Development and Build Tools
- **Vite**: Fast build tool and development server with React plugin support
- **TypeScript**: Type safety across frontend and backend code
- **React Query**: Server state management and caching for API interactions
- **Wouter**: Lightweight client-side routing library
- **React Hook Form**: Form handling with validation support
