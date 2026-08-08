import { IMove, IMoveEffect, IMoveOutcome, IMoveOutcomeChoice, IRollData } from 'src/components/models';
import { rollResultColours } from 'src/lib/moveColours';

const trackLabels: { [index: string]: string } = {
  momentum: 'Momentum',
  health: 'Health',
  spirit: 'Spirit',
  supply: 'Supply',
};

const formatEffects = (effects?: IMoveEffect[]): string => {
  if (!effects || !effects.length) return '';
  const parts = effects.map((e) => `${trackLabels[e.track] ?? e.track} ${e.delta > 0 ? '+' : ''}${e.delta}`);
  return `<div><i>${parts.join(', ')}</i></div>`;
};

export type NoteType =
  | 'actionroll' // Roller.vue — generic +stat roll, no move context
  | 'progress' // ProgressTrack.vue mark()
  | 'progressroll' // ProgressTrack.vue conclude()
  | 'moveoracleroll' // Move.vue — sub-oracle roll tied to a move
  | 'moveactionroll' // Move.vue — move-tagged +stat roll outcome, unstructured moves
  | 'moveoutcome' // Move.vue — move-tagged +stat roll outcome with structured outcome text
  | 'movereference'; // Move.vue — move name + full rules text, no roll

const FONT_SIZE = '0.95em';

// Colours a roll token (a result/score or a challenge die) by its strong-hit/weak-hit/miss
// outcome colour class. Notes never colour by move category — those colours don't mean
// anything once the journal is read outside this app. Unrecognized colour classes are left
// uncoloured rather than guessing at a fallback.
export const colourToken = (value: string | number, colorClass: string): string => {
  const c = rollResultColours[colorClass];
  return c ? `<span style="color: ${c}">${value}</span>` : `${value}`;
};

// Single-line "[...]" bracket note — used for every roll/progress-style insertion.
// `label` may already contain colourToken() spans for roll-outcome notes; non-roll
// notes (progress marks, oracle-table rolls) just pass plain text.
export const formatRollNote = (type: NoteType, label: string): string => {
  return `<div class="note ${type}"><b style="font-size: ${FONT_SIZE}">[${label}]</b></div>`;
};

// Block note carrying a move's full rules text (reference insert, no roll involved).
export const formatMoveReferenceNote = (move: IMove): string => {
  return `<div class="note movereference"><b style="font-size: ${FONT_SIZE}">[${move.name}]</b><div>${move.text}</div></div>`;
};

// Move-tagged action-roll outcome, unstructured moves (no outcomes field).
export const formatMoveActionRollNote = (move: IMove, roll: IRollData): string => {
  const label =
    `${move.name}: ` +
    `${colourToken(`${roll.result} = ${roll.action.score}`, roll.action.color)} vs ` +
    `${colourToken(roll.challenge.die1.roll, roll.challenge.die1.color)} | ` +
    `${colourToken(roll.challenge.die2.roll, roll.challenge.die2.color)}`;
  return formatRollNote('moveactionroll', label);
};

// Move-tagged action-roll outcome carrying the move's structured outcome text
// (and chosen sub-choice text, if the outcome offered one). Colours the roll-result
// tokens (result+score, each challenge die) individually by their strong-hit/weak-hit/miss
// colour, mirroring the on-screen roll display — the outcome/choice prose stays uncoloured.
export const formatMoveOutcomeNote = (
  move: IMove,
  moveType: string,
  roll: IRollData,
  outcome: IMoveOutcome,
  choice?: IMoveOutcomeChoice,
  appliedEffects?: IMoveEffect[]
): string => {
  const label =
    `${moveType}::${move.name}: ` +
    `${colourToken(`${roll.result} = ${roll.action.score}`, roll.action.color)} vs ` +
    `${colourToken(roll.challenge.die1.roll, roll.challenge.die1.color)} | ` +
    `${colourToken(roll.challenge.die2.roll, roll.challenge.die2.color)}`;
  const choiceHtml = choice ? `<div><i>${choice.label}:</i> ${choice.text}</div>` : '';
  const effectsHtml = formatEffects(appliedEffects);
  return `<div class="note moveoutcome"><b style="font-size: ${FONT_SIZE}">[${label}]</b><div>${outcome.text}</div>${choiceHtml}${effectsHtml}</div>`;
};
