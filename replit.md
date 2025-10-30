# o7.xr - AR Camera Experience

## Overview

o7.xr is a social camera application that integrates Snap Camera Kit to provide AR lens experiences. The application allows users to capture photos with AR filters, similar to popular social media camera features. Built with React and Express, it features a camera-first mobile interface with real-time lens preview and user authentication via Privy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query for server state management and data fetching

**UI Component System**
- Radix UI primitives for accessible, unstyled base components
- Tailwind CSS for utility-first styling with custom design tokens
- shadcn/ui component patterns for consistent UI elements
- Custom CSS variables for theme management (light/dark mode support)

**AR Camera Integration**
- Snap Camera Kit SDK (`@snap/camera-kit`) for AR lens rendering
- Custom `useCameraKit` hook managing camera lifecycle, permissions, and lens application
- Canvas-based rendering for real-time AR effects
- MediaStream API for camera access and video capture

**State Management Pattern**
- React hooks for local component state
- Custom hooks (`useCameraKit`) encapsulating complex camera logic
- Context providers for global state (Privy authentication)
- Query client for server-synchronized state

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript for type safety across the stack
- RESTful API design pattern

**Authentication & Authorization**
- Privy for user authentication (wallet, email, Google login)
- JWT token verification via `@privy-io/server-auth`
- Server-side token validation for protected endpoints
- User session management
- AuthGuard component wraps camera interface to enforce authentication
- Automatic user sync to backend database upon successful login
- Secure token-based API authentication on all protected routes

**Data Storage Strategy**
- In-memory storage implementation (`MemStorage`) for development
- Drizzle ORM configured for PostgreSQL (production-ready schema defined)
- User schema with Privy ID, wallet address, email, and phone number fields
- Database schema using Drizzle Kit migrations

**Rationale for Dual Storage**: The codebase includes both in-memory storage (currently active) and PostgreSQL configuration (ready for production). This allows rapid development without database setup while maintaining a clear migration path to persistent storage.

### External Dependencies

**Snap Camera Kit Integration**
- API Token and Group ID required for AR lens functionality
- Lens IDs configured per lens effect
- Bootstrap initialization pattern for Camera Kit SDK
- Real-time canvas rendering for AR effects

**Privy Authentication Service**
- App ID: `cmhdsknrh003zjp0chko9z886` (stored in VITE_PRIVY_APP_ID)
- App Secret stored securely in PRIVY_APP_SECRET environment variable
- Multiple login methods: email, wallet, Google OAuth
- Custom branding with dark theme and #C1FF72 accent color
- Server-side token verification for API security using PrivyClient
- API endpoint: POST /api/auth/login for user sync
- Authentication flow: Login → JWT verification → Database sync → Camera access

**Neon Serverless PostgreSQL**
- Configured via `@neondatabase/serverless` driver
- Connection via `DATABASE_URL` environment variable
- Designed for serverless deployment environments

**Third-Party UI Libraries**
- React Icons for social sharing icons
- Embla Carousel (via `useEmblaCarousel`) for lens selection UI
- Lucide React for icon system
- Google Fonts (Inter, Space Grotesk, Lexend Deca) for typography

### Design System

**Mobile-First Approach**
- Full viewport camera canvas (100vh)
- Touch-optimized controls for one-handed use
- Bottom-anchored control bar with safe area awareness
- Horizontal lens carousel in thumb-accessible zone

**Visual Hierarchy**
- Camera-first immersive experience with minimal UI chrome
- Floating controls with backdrop blur for readability over camera feed
- Consistent border radius system (3px to 24px scale)
- Elevation system using opacity-based overlays

**Interaction Patterns**
- Haptic feedback on capture (vibration API)
- Active state scaling for tactile feedback
- Instant visual feedback for all actions
- Permission-based progressive enhancement