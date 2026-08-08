import { describe, expect, it } from 'vitest';
import { findMove, Moves } from './moves';

describe('findMove', () => {
  it('finds a move by exact name and reports its move type', () => {
    const found = findMove('Face Danger');
    expect(found).toBeDefined();
    expect(found?.move.name).toBe('Face Danger');
    expect(found?.moveType).toBe('Adventure Moves');
  });

  it('finds moves from move types other than the first', () => {
    const found = findMove('Strike');
    expect(found?.moveType).toBe('Combat Moves');
  });

  it('returns undefined for a name that does not exist', () => {
    expect(findMove('Not A Real Move')).toBeUndefined();
  });

  it('is case-sensitive, matching the move table exactly', () => {
    expect(findMove('face danger')).toBeUndefined();
  });
});

describe('Moves table', () => {
  it('has no duplicate move names across move types', () => {
    const names = Object.values(Moves)
      .flat()
      .map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every outcome-bearing move all three outcome branches', () => {
    for (const moveType of Object.values(Moves)) {
      for (const move of moveType) {
        if (!move.outcomes) continue;
        expect(move.outcomes.strongHit).toBeDefined();
        expect(move.outcomes.weakHit).toBeDefined();
        expect(move.outcomes.miss).toBeDefined();
      }
    }
  });
});
