# Crackers Kingdom - Design System

This document outlines the visual language, design tokens, and UI patterns used in the Crackers Kingdom platform. The design is inspired by the vibrant and festive nature of fireworks, combined with a premium, high-density enterprise aesthetic.

## 🎨 Color Palette (HSL)

| Name | Variable | HSL Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `--primary` | `43 65% 52%` | Branding, Primary Buttons, Active States |
| **Festive Gold** | `--festive-gold` | `43 75% 52%` | Special Offers, Highlights, Ratings |
| **Festive Green** | `--festive-green` | `140 55% 42%` | Add Buttons, Success States, Logistics |
| **Festive Ruby** | `--festive-ruby` | `355 75% 56%` | Prices, Discounts, Urgent CTAs |
| **Festive Sapphire**| `--festive-sapphire`| `200 38% 44%` | Quality Badges, Trust Elements |
| **Background** | `--background` | `0 0% 99%` | Main Page Backgrounds |
| **Foreground** | `--foreground` | `240 10% 10%` | Primary Text, Dark Sections |
| **Footer BG** | `--footer-bg` | `240 10% 10%` | Final site section background |

---

## ✍️ Typography

### Font Families
- **Display (`--font-display`)**: `"Playfair Display", serif` — Used for headings and primary titles. Elegant and traditional.
- **Body (`--font-body`)**: `"DM Sans", sans-serif` — Used for descriptions, labels, and general content. Modern and legible.

### Hierarchy
- **H1 (Hero)**: `text-4xl md:text-6xl font-black italic tracking-tighter`
- **H2 (Section)**: `text-3xl md:text-5xl font-display font-bold`
- **H3 (Subheading)**: `text-xl md:text-2xl font-display font-bold`
- **Labels**: `text-[10px] font-black uppercase tracking-[0.2em]`

---

## ✨ Visual Effects & Animations

### Key Animations
- **Sparkle (`sparkle`)**: 2s ease-in-out infinite. Scales from 0 to 1 and back.
- **Marquee (`marquee`)**: 20s linear infinite. Used for festive anouncment bars.
- **Fade Up (`fade-up`)**: 0.6s cubic-bezier(0.16, 1, 0.3, 1). Smooth entrance with 20px translation and blur.
- **Float Up (`float-up`)**: Drifts elements from bottom to top, often used for background particles.

### Glassmorphism & Depth
- **Navbar/Overlays**: `backdrop-blur-md`, `bg-white/80` or `bg-card/90`.
- **Borders**: Defined as `hsl(var(--border))` with `border-border/50` usage.
- **Corner Radius**:
    - `lg`: `0.75rem`
    - `2xl`: `calc(0.75rem + 8px)` (~20px)

---

## 🧱 Key UI Components

### 1. Hero Carousel
- High-impact imagery with `bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/10`.
- Left-aligned content with a strong call-to-action.

### 2. Product Management (Estimate Form)
- **Table View**: High-density list (`table-auto`) with sticky headers in `bg-footer`.
- **Card View**: Responsive grid with `rounded-3xl` cards and `shadow-xl`.
- **Floating Cart**: Persistant `backdrop-blur-md` drawer for real-time quantity tracking.

---

## 📐 Layout & Spacing
- **Container Narrow**: Restricted to `72rem` (1152px) for optimal readability.
- **Section Padding**:
    - Mobile: `1rem`
    - SM: `1.5rem`
    - LG: `2rem`
- **Text Balance**: Utilizes `@utility text-balance` for headings to prevent widowed words.

---

## 🔍 Iconography
- **Library**: `lucide-react`.
- **Pattern**: Icons often wrapped in translucent backgrounds (`bg-primary/10`, `rounded-xl`) to add depth.
