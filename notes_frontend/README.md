# Notes Frontend (React)

A modern, minimalistic notes application UI built with React and vanilla CSS.  
Implements core features: create, edit, delete, list notes, and view note details.

## Features
- Create new notes
- Edit note title and content
- Save and delete notes
- List notes with search and quick preview
- View selected note details
- Local persistence via localStorage
- Modern light theme using the specified palette:
  - Primary: #1976d2
  - Secondary: #424242
  - Accent: #e91e63

## Layout
- Top bar: brand and quick actions (New Note)
- Sidebar: search and notes list
- Main area: selected note editor/details

## Scripts
- `npm start` – start dev server
- `npm test` – run tests
- `npm run build` – production build

## Notes
- Data is stored in browser localStorage under key `notes.v1`.
- No backend required for demo purposes.
