# AI Project Document Templates

A browser-based and installable desktop tool that helps you build the 5 essential documents you should write **before** prompting an AI coding assistant. Structured inputs produce a clean, copyable prompt for each document type.

---

## Download

Grab the latest installer for your platform from the [Releases](https://github.com/confox/AI-Docs-Generator/releases) page:

| Platform | File |
| -------- | ---- |
| Windows | `.msi` installer |
| macOS | `.dmg` (universal — Intel & Apple Silicon) |
| Linux | `.AppImage` or `.deb` |

---

## Why

AI coding tools give better results when given structured context. This app guides you through the five documents that together give an AI everything it needs to produce production-quality output.

## The 5 Documents

| # | Document | Purpose |
|---|----------|---------|
| 01 | **PRD** — Product Requirement Document | Tells the AI *what* to build |
| 02 | **System Design Document** | Tells the AI *how* to build it |
| 03 | **UI/UX Wireframes** | Gives the AI visual and design clarity |
| 04 | **Feature Breakdown Document** | Breaks big features into step-by-step tasks |
| 05 | **Master Prompt Document** | Combines everything into one authoritative prompt |

## How It Works

1. Select a document from the sidebar
2. Fill in each section (problem statement, architecture, design style, etc.)
3. Click **Copy as Prompt** to copy the formatted document to your clipboard
4. Paste directly into your AI coding tool (ChatGPT, Claude, Cursor, etc.)

All data stays on your machine — nothing is sent to a server.

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- [Rust](https://rustup.rs) (for desktop builds)

### Run in the browser

```bash
git clone https://github.com/confox/AI-Docs-Generator.git
cd AI-Docs-Generator/AI-Template
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Run as a desktop app

```bash
cd AI-Template
npm install
npm run tauri dev
```

### First-time setup — generate app icons

Tauri requires icons in multiple sizes. Generate them from the existing SVG once:

```bash
cd AI-Template
npm run tauri icon public/app-icon.svg
```

Commit the generated `src-tauri/icons/` directory before pushing.

### Build for production (web)

```bash
npm run build
```

Output is in `AI-Template/dist/`. Deploy to any static host (Vercel, Netlify, GitHub Pages, etc.).

### Build desktop installers locally

```bash
npm run tauri build
```

Installers are output to `AI-Template/src-tauri/target/release/bundle/`.

---

## Tech Stack

- [React 19](https://react.dev)
- [Vite 8](https://vite.dev)
- [Tauri 2](https://tauri.app) — desktop wrapper
- No external UI library — all styles are inline CSS

## Project Structure

```
ai-project-docs-generator.jsx  # Standalone component (no build tools needed)
AI-Template/
├── src/
│   ├── App.jsx             # All document definitions and UI
│   ├── main.jsx            # React entry point
│   ├── App.css
│   └── index.css
├── src-tauri/
│   ├── src/
│   │   ├── main.rs         # Desktop entry point
│   │   └── lib.rs          # Tauri app setup
│   ├── icons/              # App icons (generate with: npm run tauri icon public/app-icon.svg)
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/
│   ├── app-icon.svg        # Source icon for tauri icon command
│   └── favicon.svg         # Browser tab icon
├── index.html
└── vite.config.js
.github/
└── workflows/
    └── release.yml         # Builds installers on version tag push
```

## License

This project is licensed under the [MIT License](LICENSE.md).

Copyright (c) 2026 D4rkwolf Studios — free to use, modify, and distribute with attribution.

---

Made by [D4rkwolf Studios](https://github.com/confox)
