# Bakery App Design System & Stitch MCP Configuration

This document defines the visual language and configuration for generating UI components using **Stitch MCP** for Rizu Cake World E-commerce application.

## 🎨 Visual Identity
- **Brand Name:** Rizu Cake World
- **Vibe:** Premium, modern, boutique, artisanal.
- **Color Palette:**
  - **Primary:** Warm ochre / Gold (`hsl(var(--primary))`)
  - **Secondary:** Soft cream / Neutral (`hsl(var(--muted))`)
  - **Accent:** Deep chocolate / Dark neutral (`hsl(var(--foreground))`)
- **Typography:**
  - **Serif (Playfair Display):** Used for brand name, product titles, and hero headings.
  - **Sans (Geist Sans):** Used for navigation, UI controls, and body text.
- **Radius:** `2.5rem` for main cards and big buttons (pill-shaped / heavily rounded).

## 🛠 Stitch MCP prompt Template
When generating new components via `StitchMCP`, use the following base context:

> **System Prompt:**
> You are generating UI for a premium bakery e-commerce app. 
> - Always use **Tailwind CSS** and **Shadcn UI** styles.
> - Use `font-serif` (Playfair Display) for headings and titles.
> - Use rounded-pill (`rounded-[2.5rem]`) for primary actions and cards.
> - Theme: High-end boutique (soft shadows, glassmorphism, elegant spacing).
> - Icons: Use **Lucide React**.

## 🚀 Developer Commands (Pseudo-code for AI)
To generate a new component, use the following flow:
1. `mcp_StitchMCP_generate_screen_from_text({ prompt: "..." })`
2. Extract the JSX/Tailwind from the result.
3. Adapt to the project's data fetching (React Query / Server Actions).

## 🧩 Components generated via Stitch
- **ProductCard**: Refined in Module 8.
- **OrderCard**: Refined in Module 8.
- **NewsletterSection**: (Coming in Module 9)
- **CartDrawer**: (Potential enhancement)
