import { IMove, IMoveOutcome, IMoveOutcomeChoice, IRollData } from 'src/components/models';
import { moveCategoryColours, noteTypeColours, rollResultColours } from 'src/lib/moveColours';

export type NoteType =
  | 'actionroll' // Roller.vue — generic +stat roll, no move context
  | 'progress' // ProgressTrack.vue mark()
  | 'progressroll' // ProgressTrack.vue conclude()
  | 'moveoracleroll' // Move.vue — sub-oracle roll tied to a move
  | 'moveactionroll' // Move.vue — move-tagged +stat roll outcome, unstructured moves
  | 'moveoutcome' // Move.vue — move-tagged +stat roll outcome with structured outcome text
  | 'movereference'; // Move.vue — move name + full rules text, no roll

const FONT_SIZE = '0.95em';

// "Adventure Moves" -> "adventure", "Optional Delve Moves" -> "optional", etc.
// Mirrors Move.vue's existing header-colour derivation (props.moveType.split(' ')[0].toLowerCase()).
export const moveCategoryKey = (moveType: string): string => moveType.split(' ')[0].toLowerCase();

// Single-line "[...]" bracket note — used for every roll/progress-style insertion.
export const formatRollNote = (type: NoteType, label: string, colour?: string): string => {
  const c = colour ?? noteTypeColours[type] ?? '#88c0d0';
  return `<div class="note ${type}"><b style="color: ${c}; font-size: ${FONT_SIZE}">[${label}]</b></div>`;
};

// Block note carrying a move's full rules text (reference insert, no roll involved).
export const formatMoveReferenceNote = (move: IMove, moveType: string): string => {
  const c = moveCategoryColours[moveCategoryKey(moveType)] ?? noteTypeColours.moveoracleroll;
  return `<div class="note movereference"><b style="color: ${c}; font-size: ${FONT_SIZE}">${move.name}</b><div>${move.text}</div></div>`;
};

// Move-tagged action-roll outcome.
export const formatMoveActionRollNote = (move: IMove, moveType: string, roll: IRollData): string => {
  const c = moveCategoryColours[moveCategoryKey(moveType)];
  const label = `${move.name}: ${roll.result} = ${roll.action.score} vs ${roll.challenge.die1.roll} | ${roll.challenge.die2.roll}`;
  return formatRollNote('moveactionroll', label, c);
};

// Move-tagged action-roll outcome carrying the move's structured outcome text
// (and chosen sub-choice text, if the outcome offered one). Mirrors the
// on-screen roll display's per-token colouring (result+score by action.color,
// each challenge die by its own color) rather than colouring the whole note —
// the category::move-name prefix and the outcome/choice prose stay uncoloured.
export const formatMoveOutcomeNote = (
  move: IMove,
  moveType: string,
  roll: IRollData,
  outcome: IMoveOutcome,
  choice?: IMoveOutcomeChoice
): string => {
  const actionC = rollResultColours[roll.action.color] ?? noteTypeColours.moveoracleroll;
  const die1C = rollResultColours[roll.challenge.die1.color] ?? noteTypeColours.moveoracleroll;
  const die2C = rollResultColours[roll.challenge.die2.color] ?? noteTypeColours.moveoracleroll;
  const label =
    `${moveType}::${move.name}: ` +
    `<span style="color: ${actionC}">${roll.result} = ${roll.action.score}</span> vs ` +
    `<span style="color: ${die1C}">${roll.challenge.die1.roll}</span> | ` +
    `<span style="color: ${die2C}">${roll.challenge.die2.roll}</span>`;
  const choiceHtml = choice ? `<div><i>${choice.label}:</i> ${choice.text}</div>` : '';
  return `<div class="note moveoutcome"><b style="font-size: ${FONT_SIZE}">${label}</b><div>${outcome.text}</div>${choiceHtml}</div>`;
};
