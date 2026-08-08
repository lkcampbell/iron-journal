import { describe, expect, it } from 'vitest';
import { NewCharacter, NewJournal } from './campaign';

// NewCampaign() is not tested here: it calls require('../assets/default-map.jpg'),
// a webpack-specific asset require that only resolves inside a webpack build.

describe('NewCharacter', () => {
  it('starts with default track values matching the rulebook baseline', () => {
    const character = NewCharacter();
    expect(character.tracks.health).toEqual({ value: 5, max: 5, min: 0 });
    expect(character.tracks.spirit).toEqual({ value: 5, max: 5, min: 0 });
    expect(character.tracks.supply).toEqual({ value: 5, max: 5, min: 0 });
    expect(character.tracks.momentum).toEqual({ value: 2, max: 10, min: -6, reset: 2 });
  });

  it('starts with all stats at zero and no conditions/banes/burdens marked', () => {
    const character = NewCharacter();
    expect(Object.values(character.stats).every((s) => s === 0)).toBe(true);
    expect(Object.values(character.debilities.conditions).every((c) => c === false)).toBe(true);
    expect(Object.values(character.debilities.banes).every((c) => c === false)).toBe(true);
    expect(Object.values(character.debilities.burdens).every((c) => c === false)).toBe(true);
  });

  it('assigns a non-empty rolled name', () => {
    const character = NewCharacter();
    expect(character.name).toBeTruthy();
  });

  it('gives each new character an independent bonds track', () => {
    const a = NewCharacter();
    const b = NewCharacter();
    a.bonds.boxes[0] = 5;
    expect(b.bonds.boxes[0]).toBe(0);
  });
});

describe('NewJournal', () => {
  it('creates an empty entry with matching created/updated timestamps', () => {
    const entry = NewJournal();
    expect(entry.title).toBe('New journal entry');
    expect(entry.content).toBe('');
    expect(entry.createdAt).toBe(entry.updatedAt);
  });
});
