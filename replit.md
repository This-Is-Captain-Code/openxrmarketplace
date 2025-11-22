# o7.xr - AR Camera Experience

## Overview

o7.xr is a social camera application that integrates Snap Camera Kit to provide AR lens experiences. The application allows users to capture photos with AR filters, similar to popular social media camera features. Built with React and Express, it features a camera-first mobile interface with real-time lens preview, free AR lens selection, and user authentication via Privy.

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

**Key Features**
- Free AR lens selection and application
- Real-time camera preview with AR effects
- Photo capture with AR filters applied
- Lens marketplace browser
- User profile with wallet management

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
- PostgreSQL database using Replit's built-in Neon serverless database
- Drizzle ORM for type-safe database queries and schema management
- User schema with Privy ID, wallet address, email, and phone number fields
- Database migrations managed via `npm run db:push` command
- Connection via `DATABASE_URL` environment variable (automatically configured)

**Database Tables**:
- `users`: Stores authenticated user data with UUID primary keys
  - id: varchar (UUID, auto-generated)
  - privyId: text (unique, not null)
  - walletAddress: text (nullable)
  - email: text (nullable)
  - phoneNumber: text (nullable)
  - createdAt: timestamp (auto-generated)

### External Dependencies

**Snap Camera Kit Integration**
- API Token and Group ID required for AR lens functionality
- Lens IDs configured per lens effect
- Bootstrap initialization pattern for Camera Kit SDK
- Real-time canvas rendering for AR effects

**Saga Blockchain Integration (GameLicensing Contract)**
- Chain: Saga Chainlet (OpenXR)
- Chain ID: 2763783314764000
- RPC URL: https://openxr-2763783314764000-1.jsonrpc.sagarpc.io
- Block Explorer: https://openxr-2763783314764000-1.sagaexplorer.io
- Contract Address: 0x91C7B6f8905060D6aE711878020DB15E90C697E0
- Native Token: XRT (18 decimals)
- License Price: 2324 XRT per purchase
- All 12 AR lenses share the same gameId (1) on the smart contract
- Once purchased, all lenses become accessible (single purchase unlocks all)
- Wallet Integration: Keplr wallet for EVM transactions on Saga chain
- Transaction Flow: User purchases license → Smart contract verifies payment → All lenses unlocked

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

## Recent Changes

### November 22, 2025 - Saga Blockchain Integration & License Purchase Fix
- **CRITICAL FIX**: Updated Saga chain configuration from incorrect chainId 2763779114927000 to correct chainId 2763783314764000
- Fixed RPC URL to point to correct Saga Chainlet where GameLicensing contract is deployed
- Configured all 12 AR lenses to use shared gameId 1 on the smart contract
- Single license purchase (2324 XRT) now unlocks all 12 AR lenses
- Added comprehensive balance checking and transaction logging for debugging
- Fixed license verification to use numeric gameIds instead of string lens IDs
- Implemented proper error handling for insufficient balance and transaction failures
- Added detailed console logging for transaction debugging (balance, gas costs, total costs)
- Updated contract integration to use correct blockchain explorer and RPC endpoints

### November 22, 2025 - Netflix-Style UI Redesign & Responsive Design
- Redesigned lens selection page with Netflix-style horizontal cards (16:9 aspect ratio)
- Added 12 abstract art and neon holographic cover images for AR lens cards
- Created unified Lens type in `@/types/lens.ts` with displayName and coverImage fields
- Updated lens naming: formatted as "Lens 01" through "Lens 12" with funky names like "Cosmic Vibes", "Rainbow Blast", "Pixel Paradise", "Electric Dreams"
- Implemented bottom-to-top gradient overlay (from-black/90 via-black/40 to-transparent) over sharp cover images for Netflix-style appearance
- Enhanced text hierarchy with prominent badges, bold display names, and drop shadows
- Made lens selection completely free and instant (no payment flow)
- Removed Fluent testnet and x402 payment infrastructure
- Cleaned up wallet dialog to remove payment-related UI
- Added logout button to both Marketplace and CameraView pages

**Responsive Design Implementation:**
- Marketplace page: Fully responsive grid layout (1 col mobile, 2 cols sm, 3 cols lg, 4 cols xl)
- Marketplace page: Max-width constraint (max-w-7xl) centers content on desktop monitors
- Marketplace page: Responsive text sizes, icon sizes, spacing, and header height across breakpoints
- CameraView page: Constrained camera view on desktop (max-w-2xl, centered with rounded corners)
- CameraView page: Full-screen camera on mobile, 90vh with subtle rounding on desktop
- CameraView page: Responsive button sizing, icon sizing, and status text visibility (hidden on mobile)
- All components adapt smoothly between mobile and desktop form factors