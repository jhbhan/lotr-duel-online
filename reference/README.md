# Official game references

Game: The Lord of the Rings: Duel for Middle-earth (Repos Production, 2024).

Saved on 2026-10-25 for the React/TypeScript adaptation project.

- `player-aid-en.pdf`: official two-page English player aid.
- `player-aid-landmarks-and-ring.png`: rendered page 1, landmark and Ring quest effects.
- `player-aid-alliance-effects.png`: rendered page 2, all six races' alliance token effects.

Source page: https://www.rprod.com/en/games/duel-for-middle-earth
Source PDF: https://cdn.svc.asmodee.net/production-rprod/storage/games/7-wonders-LOTR/7dume-en01-player-aid-1726668186R5ckw.pdf
Rulebook supplied by user: https://bghub.org/r/thelordoftheringduelformiddleearth.pdf

Implementation note: Use this aid together with the rulebook for landmark, Ring bonus, and alliance effects. Preserve distinctions between immediate effects and ongoing token abilities. Card faces, costs, chaining symbols, map connections, and track positions still need to be recorded from the actual components.

Runtime note: Node v24.22.1 and npm 11.19.1 are installed under `/Users/jasonbhan/.nvm/versions/node/v24.22.1/bin`. The agent shell does not currently include that directory in PATH; commands can prepend that directory when running the project.

## Machine-readable transcriptions

- `rules-reference.json`: all effects in the two player-aid images: six Ring effect meanings and 18 alliance token abilities, with timing, source references, and terminology mappings.
- `landmarks-reference.json`: all seven landmarks, their destination regions, resource counts read from the tile photograph, and effects read from the aid.
- `landmark-tiles.HEIC`: user-supplied physical tile photo, originally `IMG_8831.HEIC`.

These JSON files are reference material for later parsing, not runtime implementation. Descriptions preserve the rules in readable prose. Source paths are relative to this directory. Unknown values use `null` and explicit notes; notably the yellow tower symbol's additional cost formula needs rulebook verification. The reference directory currently contains the two player-aid pages, not a full photographed rulebook. The Markdown implementation plan is commentary, not a separate rules source.
