import { IMove, IRollData } from 'src/components/models';
import { moveCategoryColours, noteTypeColours } from 'src/lib/moveColours';

export type NoteType =
  | 'actionroll' // Roller.vue — generic +stat roll, no move context
  | 'progress' // ProgressTrack.vue mark()
  | 'progressroll' // ProgressTrack.vue conclude()
  | 'moveoracleroll' // Move.vue — sub-oracle roll tied to a move
  | 'moveactionroll' // Move.vue — move-tagged +stat roll outcome
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
