import { describe, expect, it } from 'vitest';
import { IMove, IMoveEffect, IMoveOutcome, IRollData } from 'src/components/models';
import {
  colourToken,
  formatMoveActionRollNote,
  formatMoveOutcomeNote,
  formatMoveReferenceNote,
  formatRollNote,
} from './journalNotes';

const move: IMove = {
  name: 'Face Danger',
  source: 'Ironsworn Rulebook, page 60',
  keywords: 'adventure risky threat',
  text: 'When you attempt something risky...',
};

const roll: IRollData = {
  action: { die: 4, score: 7, color: 'text-positive' },
  challenge: {
    die1: { roll: 3, color: 'text-positive' },
    die2: { roll: 5, color: 'text-positive' },
    match: false,
  },
  progress: false,
  result: 'Strong Hit',
};

describe('colourToken', () => {
  it('wraps the value in a span coloured by a known colour class', () => {
    expect(colourToken(7, 'text-positive')).toBe('<span style="color: #a3be8c">7</span>');
  });

  it('leaves unrecognized colour classes uncoloured', () => {
    expect(colourToken(7, 'not-a-real-class')).toBe('7');
  });
});

describe('formatRollNote', () => {
  it('wraps the label in a bracketed note div tagged with the note type', () => {
    const html = formatRollNote('actionroll', 'some label');
    expect(html).toContain('class="note actionroll"');
    expect(html).toContain('[some label]');
  });
});

describe('formatMoveReferenceNote', () => {
  it('includes the move name and full rules text', () => {
    const html = formatMoveReferenceNote(move);
    expect(html).toContain('class="note movereference"');
    expect(html).toContain(move.name);
    expect(html).toContain(move.text);
  });
});

describe('formatMoveActionRollNote', () => {
  it('includes the move name, roll result/score, and both challenge dice', () => {
    const html = formatMoveActionRollNote(move, roll);
    expect(html).toContain('class="note moveactionroll"');
    expect(html).toContain(move.name);
    expect(html).toContain('Strong Hit = 7');
    expect(html).toContain('>3<');
    expect(html).toContain('>5<');
  });
});

describe('formatMoveOutcomeNote', () => {
  const outcome: IMoveOutcome = {
    text: 'You are successful. Take +1 momentum.',
    effects: [{ track: 'momentum', delta: 1 } as IMoveEffect],
  };

  it('includes the outcome text and applied track effects', () => {
    const html = formatMoveOutcomeNote(move, 'Adventure Moves', roll, outcome, undefined, outcome.effects);
    expect(html).toContain('class="note moveoutcome"');
    expect(html).toContain('Adventure Moves::Face Danger');
    expect(html).toContain(outcome.text);
    expect(html).toContain('Momentum +1');
  });

  it('includes the chosen sub-choice label and text when provided', () => {
    const html = formatMoveOutcomeNote(move, 'Adventure Moves', roll, outcome, {
      label: 'Delayed, lose advantage, or new danger',
      text: 'Suffer -1 momentum.',
    });
    expect(html).toContain('Delayed, lose advantage, or new danger');
    expect(html).toContain('Suffer -1 momentum.');
  });
});
