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
- `src/models/index.ts`: typed placeholders for users, game state, territories, player resources, cards and card types, and the Ring journey.
- `src/styles.css`: responsive Middle-earth-inspired styling; CSS landscape requires no image assets. Google Fonts are optional, with local fallbacks.
- `reference/`: existing official player aid and reference notes.

The begin button creates an in-memory setup draft. Starting resources, map, cards, Ring track, rules, persistence, and multiplayer are deliberately unimplemented. Resource and card categories are provisional until component data is verified. This is an unofficial fan project.
