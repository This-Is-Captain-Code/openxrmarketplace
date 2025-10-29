# Design Guidelines: o7.xr (oseven.xyz)

## Design Approach

**Selected Approach:** Reference-Based Design inspired by leading social camera applications (Snapchat, Instagram Camera, TikTok, BeReal)

**Key Design Principles:**
- Immersive camera-first experience with minimal UI distraction
- Touch-optimized interactions for one-handed mobile use
- Instant visual feedback for all camera actions
- Seamless AR lens discovery and application
- Modern, confident aesthetic that emphasizes content over chrome

---

## Typography System

**Primary Font:** Inter or DM Sans (via Google Fonts CDN)
**Accent Font:** Space Grotesk for bold statements

**Hierarchy:**
- Camera UI Labels: 10-12px, medium weight, uppercase tracking
- Lens Names: 14px, semibold
- Button Text: 14-16px, medium weight
- Permission/Error Messages: 16px, regular weight
- Photo Metadata: 12px, regular, subtle styling

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8)

**Mobile-First Structure:**
- Full viewport camera canvas (100vh minus UI overlays)
- Persistent bottom control bar (safe area aware)
- Top status strip for camera mode indicators
- Floating action buttons positioned for thumb reach
- Carousel positioned in comfortable swipe zone

**Component Positioning:**
- Top bar: Fixed at top, h-14, flex items for status
- Bottom controls: Fixed at bottom, h-20 to h-24, primary actions centered
- Side controls: Vertical stack on right edge (30-40px from edge)
- Lens carousel: Horizontal scroll, bottom third of screen

---

## Core Component Library

### Camera Canvas Container
- Full-screen canvas element (w-full h-screen)
- Aspect ratio maintained via object-fit
- Touch events pass-through except on UI elements
- Gradient overlays top/bottom for UI contrast (subtle 100px fade)

### Control Bar (Bottom)
- Translucent backdrop blur effect
- Rounded corners top (rounded-t-3xl)
- Safe area padding bottom
- Three-zone layout: left utilities, center capture, right modes
- Button spacing: gap-4 to gap-6

### Capture Button
- Large circular button: 72px diameter
- Nested ring design (outer ring 4px stroke, inner filled circle)
- Center positioned absolutely
- Haptic feedback on press (via vibration API)
- Scale animation on tap (scale from 1 to 0.9)

### Camera Toggle Button
- Circular icon button: 48px diameter
- Backdrop blur with semi-transparent fill
- Rotation animation on toggle (180deg transform)
- Position: bottom-left zone or top-right corner

### Flash Toggle
- Icon-only button: 40px square
- Three states: off, on, auto (icon variations)
- Visual state indicator (subtle glow when active)
- Position: top control strip

### Lens Carousel
- Horizontal scrollable container
- Snap scroll behavior (scroll-snap-type-x mandatory)
- Item width: 80px, height: 80px
- Gap between items: gap-3
- Centered alignment with padding-x
- Active lens: border ring (2px), slightly larger scale (1.05)
- Inactive lens: opacity-70

### Lens Thumbnail Cards
- Rounded squares: rounded-2xl
- Preview image or gradient placeholder
- Lens name label overlay (bottom, small text)
- Tap to apply interaction
- Loading state: skeleton shimmer

### Permission Screen
- Full-screen centered layout
- Icon (camera): 64px to 80px
- Heading: 24px, bold
- Description: 16px, max-w-sm, center-aligned
- Primary CTA button: Large, full-width (max-w-xs)
- Spacing: Stack with gap-6

### Error States
- Toast-style notifications
- Slide up from bottom
- Rounded container: rounded-2xl, p-4
- Icon + message horizontal layout
- Dismiss button or auto-dismiss after 4s
- Position: bottom offset by 100px

### Loading States
- Circular spinner: 24px for inline, 48px for full-screen
- Skeleton loaders for lens thumbnails (pulsing animation)
- Progress indication for lens loading (thin horizontal bar)

### Photo Preview Modal
- Full-screen overlay (z-index high)
- Captured photo: aspect-fit, centered
- Top bar: Close/Back button, share actions
- Bottom bar: Save, retake, edit options
- Swipe down to dismiss gesture

---

## Interaction Patterns

### Gestures
- Pinch to zoom on camera canvas
- Swipe carousel horizontally for lens browsing
- Tap to focus on camera feed
- Long press capture button for video (future enhancement)
- Swipe down on modals to dismiss

### Transitions
- Lens changes: Crossfade 200ms
- Modal entry/exit: Slide up/down 300ms with ease-out
- Button presses: Scale 100ms
- Carousel scroll: Smooth snap with deceleration
- Camera toggle: Flip animation 400ms

### Feedback
- Haptic vibration on capture (50ms)
- Subtle pulse on successful lens application
- Error shake animation for failures
- Visual flash effect on photo capture (white overlay fade)

---

## Responsive Considerations

**Mobile Portrait (Primary):**
- Stack all controls vertically
- Full-height camera canvas
- Bottom-anchored control bar
- Carousel at bottom third

**Mobile Landscape:**
- Relocate controls to vertical side strips
- Carousel becomes vertical on left/right
- Capture button remains accessible

**Tablet (iPad):**
- Maintain mobile-like interface
- Slightly larger button sizes (scale by 1.2)
- More generous spacing (scale spacing by 1.5)

---

## Accessibility

- High contrast icons and text overlays
- Focus indicators for keyboard navigation (ring-2 offset-2)
- Screen reader labels for all icon buttons
- Error messages in text, not just visual indicators
- Minimum touch target: 44px × 44px
- Reduced motion: Disable non-essential animations when prefers-reduced-motion

---

## Animation Budget

**Essential Animations Only:**
- Capture button press feedback
- Lens carousel scroll snap
- Modal transitions
- Camera flip transition
- Photo flash effect

**Avoid:**
- Decorative background animations
- Continuous looping effects
- Parallax scrolling
- Excessive micro-interactions

---

## Images

**No Traditional Hero Image:** The live camera feed serves as the dynamic hero element

**Image Requirements:**
- Lens thumbnails: 80×80px previews showing lens effect example
- Permission screen icon: Camera glyph or illustration
- Empty state: Minimal illustration for "no lenses" state
- Error state icons: Camera blocked, network error glyphs