# Alliance and landmark implementation plan

Source: the local `player-aid-alliance-effects.png` and `player-aid-landmarks-and-ring.png` supplied for this project. This is a plan; the effects are not implemented yet.

## 1. Model the rules as data

Define individual alliance tokens with an ID, race, effect, and timing (`ongoing` or `on_gain`). Store shuffled face-down stacks, token ownership, and public/private information in the game state. Keep race symbols on cards distinct from owned alliance tokens and from the Eagle bonus symbol.

Define seven landmark tiles with ID, name, territory, verified acquisition cost, and an ordered effect list. Track available and claimed tiles. Landmark and immediate token effects fire exactly once, when gained. Capture missing costs as unverified data rather than inventing them.

Replace ambiguous numeric card costs/chain symbols with explicit coin, resource, and chain-requirement fields. The existing `src/data/cards.json` is a photo transcription, not a final runtime schema.

## 2. Build an effect resolver and pending choices

Run actions through one resolver: validate and pay, acquire the card/token/tile, resolve its effects and ownership triggers, then advance the turn. Use a queue for choices such as selecting a territory, selecting an opponent resource card, splitting units, or choosing a discarded card. Preserve the current actor while choices are pending and block unrelated actions.

Resolve immediate victory after each atomic effect; once victory occurs, stop subsequent choices and turn advancement. Track extra turns and once-per-turn ability usage explicitly. Define a consistent effect order after verifying the rulebook, including simultaneous triggered abilities.

Shared effects: gain/lose coins, produce a skill, place units, move a unit along an adjacent route, remove a unit or fortress, advance the Ring track, grant an extra turn, gain a race symbol, choose a token, and play a discarded card for free. Reuse territory adjacency data and military conflict rules. An unrestricted placement and an adjacent movement are different actions.

The Ring helper currently caps a single counter at 15. It must be updated to the agreed pursuit model before effects that advance it can use it: Fellowship starts 12 spaces ahead, both move upward, Sauron wins by catching Fellowship, and Fellowship wins at its destination. Track bonus rewards and previously resolved milestones separately.

## 3. Implement all 18 alliance tokens

| Race   | Timing         | Effect                                                                                                                                                      |
| ------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Elf    | Ongoing        | Playing a yellow card grants an extra turn after the current one.                                                                                           |
| Elf    | Ongoing        | A red card may place all its units in any one of the seven territories.                                                                                     |
| Elf    | Once per turn  | Benefit from any one skill; reset usage at the correct turn boundary.                                                                                       |
| Dwarf  | Ongoing        | Ignore the additional coin cost when acquiring a landmark.                                                                                                  |
| Dwarf  | Ongoing        | Acquiring a landmark grants an extra turn.                                                                                                                  |
| Dwarf  | Ongoing        | Playing a green card also grants two movements.                                                                                                             |
| Hobbit | Ongoing symbol | Add an Eagle symbol that counts as one of the six symbols required for race victory.                                                                        |
| Hobbit | Ongoing        | Playing a blue card also places one unit in any territory.                                                                                                  |
| Hobbit | Ongoing        | Acquiring a card by chaining also grants three coins.                                                                                                       |
| Human  | Ongoing        | Playing a yellow card also advances the Ring track one step.                                                                                                |
| Human  | Ongoing        | A red card places one additional unit in its chosen territory.                                                                                              |
| Human  | Ongoing        | Selling/discarding a chapter card for coins grants twice the chapter amount: 2, 4, or 6. Do not trigger this for arbitrary removal effects.                 |
| Ent    | Immediate      | Grant an extra turn.                                                                                                                                        |
| Ent    | Immediate      | Remove one enemy fortress from any territory and return it to its owner.                                                                                    |
| Ent    | Immediate      | Make three sequential choices: remove an enemy unit, make the opponent lose one coin, or perform one movement. Recalculate legal options after each choice. |
| Wizard | Immediate      | Advance the Ring track two steps.                                                                                                                           |
| Wizard | Immediate      | Place two units in one territory or one unit in each of two territories.                                                                                    |
| Wizard | Immediate      | Privately choose a card from the discard and play it for free.                                                                                              |

Check race victory using distinct qualifying symbols, including Eagle; the current exact `Set.size === 6` check needs to handle six or more qualifying symbols. Keep token abilities separate so gaining a symbol alone does not grant all three abilities of that race.

## 4. Implement all seven landmarks

| Landmark     | Territory | Ordered immediate effects                                                                                                                        |
| ------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Barad-dûr    | Mordor    | Place one fortress; privately select a discarded card and play it for free.                                                                      |
| Bree         | Arnor     | Place one fortress and two units; perform two movements.                                                                                         |
| Erebor       | Rhovanion | Place one fortress; gain five coins; perform one movement.                                                                                       |
| Grey Havens  | Lindon    | Place one fortress; choose a race stack, reveal its top two tokens, keep one and resolve it, return the other face down to the top of its stack. |
| Helm’s Deep  | Rohan     | Place one fortress and three units.                                                                                                              |
| Isengard     | Enedwaith | Place one fortress; discard one opponent gray resource card; advance the Ring track one step.                                                    |
| Minas Tirith | Gondor    | Place one fortress and one unit; advance the Ring track two steps.                                                                               |

Free discarded-card play must skip payment while still resolving the acquired card’s effects and the appropriate ongoing abilities. Gray-card removal must remove only that card’s resource production, preserving production from other copies. The current `removeCardFromUser` filters out the card before looking it up; fix that order and duplicate-resource handling first.

## 5. Add the user interface

- Add available landmarks to game controls, with cost, destination, effects, and acquisition action.
- Show owned alliance tokens and active abilities in the player information modal.
- Use the territory map for placement, movement, and removal selections; show only legal targets.
- Add token-choice, discarded-card, and opponent-resource-card selection modals. Preserve hidden information for private choices; the current local prototype will need an explicit handoff or separate player views before multiplayer.
- Use the requested textured colors, symbols, and concise effect text; illustrations are optional.

## 6. Verify the missing acquisition rules before implementing them

The player aids describe effects but do not fully specify when race symbols award tokens, exact token-stack setup, landmark resource prices and additional coin pricing, tile availability, fortress supply/placement restrictions, or all timing interactions. Read the complete rulebook or inspect the physical components before encoding these. Confirm the once-per-turn wildcard skill’s scope and whether a free discarded-card play counts as chaining for coin rewards.

## 7. Focused validation

Test immediate effects run once; abilities trigger only for their owner and correct event; wildcard skill usage resets correctly; Eagle contributes one distinct symbol; chained card rewards require actual chaining; sales grant the correct chapter amount; landmark discounts affect only the additional cost; extra turns and nested effects resolve correctly; targets obey territory routes and ownership; duplicate production survives gray-card removal; token-stack order is preserved; free plays cannot select the same discarded card twice; and victory interrupts unfinished effects.

Implement in this order: authoritative player/token/tile state and verified costs, shared effect queue, ongoing alliance abilities, immediate tokens, landmarks, UI choices, then end-to-end turn and victory checks.
