# Duel for Middle-earth

A React + TypeScript app powered by Vite, starting with a responsive faction-selection screen.

## Development

Requires Node.js 22.12+ (or 20.19+) and npm.

```sh
npm install
npm run dev
```

```sh
npm run build
npm run preview
```

If Node is not on your shell PATH, this machine has it at `/Users/jasonbhan/.nvm/versions/node/v24.22.1/bin`.

## Starting point

- `src/App.tsx`: starting screen with Fellowship / Sauron selection and local setup creation.
- `src/models/index.ts`: domain types; `src/data/initialGameState.ts` creates a new local game.
- `src/engine/`: chapter actions, landmark purchases, and shared turn/effect resolution.
- `src/components/GamePlay/`: dialogs, player summaries, and reusable card/territory choices.
- `src/styles.css`: style entry point; `src/styles/` groups styles by feature. Typography, color, and spacing tokens live in `base.css`. Google Fonts are optional, with local fallbacks.
- `reference/`: existing official player aid and reference notes.

The begin button creates an in-memory setup draft. Starting resources, map, cards, Ring track, rules, persistence, and multiplayer are deliberately unimplemented. Resource and card categories are provisional until component data is verified. This is an unofficial fan project.
