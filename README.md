# AI Project Document Templates

A browser-based and installable desktop tool that helps you build the **10 essential documents** you should write **before** prompting an AI coding assistant. Structured inputs produce a clean, copyable prompt for each document type.

---

## Download

Grab the latest installer for your platform from the [Releases](https://github.com/confox/AI-Document-Generator/releases) page:

| Platform | File |
| -------- | ---- |
| Windows | `.msi` installer |
| macOS | `.dmg` (universal — Intel & Apple Silicon) |
| Linux | `.AppImage` or `.deb` |

Or use it instantly in the browser — no install required:  
**[Open in browser →](https://d4rk-wolf.github.io/AI-Document-Generator/)**

---

## Why

Most vibecoded projects fail not because of bad code, but because of missing context. A missing data model leads to inconsistent schemas. No security plan means vulnerable code by default. No `AGENTS.md` means every AI session starts from scratch.

This app guides you through the ten documents that give your AI coding tool everything it needs to produce production-ready output — in the right order, every time.

## The 10 Documents

| # | Document | What it gives the AI |
|---|----------|----------------------|
| 01 | **PRD** — Product Requirement Document | What to build and who it's for |
| 02 | **System Design Document** | How to architect and build it |
| 03 | **UI/UX Wireframes** | Visual and design clarity |
| 04 | **Feature Breakdown Document** | Step-by-step build order for each feature |
| 05 | **Master Prompt Document** | One authoritative prompt combining everything |
| 06 | **Data Model Document** | Consistent entities, relationships, and schema |
| 07 | **Security & Compliance Checklist** | Safe, secure code by design — not as an afterthought |
| 08 | **Testing Strategy** | What tests to write and how to structure them |
| 09 | **Deployment & DevOps Plan** | How the app is hosted, built, and shipped |
| 10 | **AGENTS.md Generator** | Persistent rules for Cursor, Claude, Copilot, and other agents |

## How It Works

1. Select a document from the sidebar
2. Fill in each section (problem statement, architecture, design style, etc.)
3. Click **Copy as Prompt** to copy the formatted document to your clipboard
4. Paste directly into your AI coding tool (ChatGPT, Claude, Cursor, etc.)

All data stays on your machine — nothing is sent to a server.

---

## Examples

The `examples/` folder contains all 10 documents fully filled in for a fictional project — **TaskFlow**, a team task management SaaS app. Use them as a reference when writing your own.

| File | Document |
|------|----------|
| [01_prd.md](examples/01_prd.md) | Product Requirement Document |
| [02_system_design.md](examples/02_system_design.md) | System Design Document |
| [03_uiux_wireframes.md](examples/03_uiux_wireframes.md) | UI/UX Wireframes |
| [04_feature_breakdown.md](examples/04_feature_breakdown.md) | Feature Breakdown Document |
| [05_master_prompt.md](examples/05_master_prompt.md) | Master Prompt Document |
| [06_data_model.md](examples/06_data_model.md) | Data Model Document |
| [07_security.md](examples/07_security.md) | Security & Compliance Checklist |
| [08_testing_strategy.md](examples/08_testing_strategy.md) | Testing Strategy |
| [09_deployment.md](examples/09_deployment.md) | Deployment & DevOps Plan |
| [10_agents_md.md](examples/10_agents_md.md) | AGENTS.md — AI Rules File |

---

## Contributing

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- [Rust](https://rustup.rs) (for desktop builds only)

### Run locally

```bash
git clone https://github.com/confox/AI-Document-Generator.git
cd AI-Document-Generator/AI-Template
npm install
npm run dev        # browser: http://localhost:5173
npm run tauri dev  # desktop app
```

### Adding a new document type

Open `AI-Template/src/docs.js` and add a new object to the `DOCS` array. The app renders all documents from this array dynamically — no other files need changing. See [AGENTS.md](AGENTS.md) for the full contributor guide.

### Releases

Desktop installers (`.msi`, `.dmg`, `.AppImage`, `.deb`) are built automatically by GitHub Actions when a version tag is pushed:

```bash
git tag v1.x.x && git push origin v1.x.x
```

### Tech Stack

- [React 19](https://react.dev) + [Vite 8](https://vite.dev)
- [Tauri 2](https://tauri.app) — desktop wrapper
- No external UI library — all styles are inline CSS

---

## License

This project is licensed under the [MIT License](LICENSE.md).

Copyright (c) 2026 D4rkwolf Studios — free to use, modify, and distribute with attribution.

---

Made by [D4rkwolf Studios](https://github.com/confox)
