# UI/UX Wireframes
> Gives the AI visual and design clarity

## Key Screens
- Landing page (marketing, not logged in)
- Login / Register page
- Email verification pending screen
- Onboarding: Create first project
- Project Kanban board (main app screen)
- Task detail modal (open on task click)
- Team management screen (invite / remove members)
- User profile / settings screen
- Project settings screen (rename, delete)
- Empty state screens (no projects, no tasks)

## Layout Ideas
Landing: Full-width hero with headline, subheadline, and two CTAs ("Start for free" / "See demo"). Below: 3-column feature highlights. Footer with links.

App shell: Fixed left sidebar (240px) with project list, user avatar at bottom, settings icon. Main content area fills remaining space. Top bar shows current project name + "Invite" button.

Kanban board: 4 fixed-width columns (each ~280px), horizontally scrollable on small screens. Each column has a header with status name + task count badge. Tasks are cards with: title, assignee avatar, a coloured priority dot. "+ Add task" button at the bottom of each column.

Task modal: Slides in from the right as a side panel (480px wide). Contains: editable title at top, status dropdown, assignee picker, description textarea (markdown supported), created/updated metadata at the bottom.

## Color Palette
Primary (brand): #6366F1 (Indigo)
Secondary: #8B5CF6 (Purple)
Accent / CTA: #10B981 (Emerald green)
Background (app): #0F172A (near-black navy)
Surface (cards, sidebar): #1E293B
Border / dividers: #334155
Text primary: #F1F5F9
Text secondary: #94A3B8

## Fonts & Typography
Heading font: Inter — weights 600 and 700, sizes 24px (page titles) / 18px (section headings) / 15px (card titles)
Body font: Inter — weight 400, size 14px for body text, 12px for metadata
Mono font: JetBrains Mono — used for task IDs, code snippets
Line height: 1.5 for body, 1.2 for headings

## Design Style
Dark-mode first, minimal, high-information-density. Inspired by Linear.app. No gradients on UI elements — flat surfaces with subtle borders. Micro-animations on task drag-and-drop (150ms ease). Rounded corners: 6px on cards, 4px on inputs, 8px on modals.
