# LUPERTA — Premium Streaming Discovery Platform

<div align="center">
  <img src="public/logo.png" alt="LUPERTA Logo" width="120">
  <p><strong>Next-generation cinematic discovery and streaming platform</strong></p>
</div>

---

## Overview

**LUPERTA** is a high-performance streaming discovery platform built on Next.js, React, Tailwind CSS, and TypeScript. It pairs rich TMDB metadata with 4 independent, reliable playback providers and zero-friction client-side storage.

## Features

- 🎬 **Rich TMDB Metadata & Artwork**: Full movie & TV series discovery, cast details, trending hero banners, curated collections, and smart recommendations.
- 📺 **4 Playback Providers**:
  - **VidSrc**: High-speed embed player with automatic playback support.
  - **VidLink**: Modern video stream provider with customizable styling.
  - **VidLux**: Reliable alternate streaming provider.
  - **CineSrc**: Clean provider with custom progress sync and color accents.
- ⚡ **Zero-Barrier Direct Access**: No mandatory logins, passwords, account creation, or email verification. Open the website and start watching immediately.
- 💾 **Seamless Local Storage**: Automatically saves watch history, resume points, continue watching rails, favorites, and settings directly in browser localStorage.
- 📱 **Adaptive Cinematic UI**: Glassmorphic dark design system, smooth Framer Motion transitions, responsive desktop sidebar, and fluid mobile navigation.
- 🌐 **Internationalization**: Full multi-language support (English and Chinese) with synchronized TMDB localization.

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- pnpm / npm

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

Configured in `.env` / `.env.local`:
```env
SITE_NAME=LUPERTA
TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_STORAGE_TYPE=localstorage
NEXT_PUBLIC_ENABLE_REGISTER=false
PORT=3000
```
