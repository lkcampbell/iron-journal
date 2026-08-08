import { describe, expect, it } from 'vitest';
import { ICharacter } from 'src/components/models';
import { applyTrackEffect, Difficulty, NewMenace, NewProgressTrack } from './tracks';

describe('NewProgressTrack', () => {
  it('creates an empty 10-box track at the easiest difficulty', () => {
    const track = NewProgressTrack();
    expect(track.difficulty).toBe(1);
    expect(track.boxes).toHaveLength(10);
    expect(track.boxes.every((b) => b === 0)).toBe(true);
    expect(track.showMenace).toBe(false);
  });
});

describe('NewMenace', () => {
  it('creates a 10-box menace track with all boxes unmarked', () => {
    const menace = NewMenace();
    expect(menace.boxes).toHaveLength(10);
    expect(menace.boxes.every((b) => b === false)).toBe(true);
  });
});

describe('Difficulty', () => {
  it('defines mark-per-progress-roll for all five ranks', () => {
    expect(Object.keys(Difficulty)).toHaveLength(5);
    expect(Difficulty[1].label).toBe('Troublesome');
    expect(Difficulty[5].label).toBe('Epic');
  });
});

function newCharacter(): ICharacter {
  return {
    name: 'Test',
    location: '',
    xp: 0,
    stats: { edge: 0, heart: 0, iron: 0, shadow: 0, wits: 0 },
    tracks: {
      health: { value: 5, max: 5, min: 0 },
      spirit: { value: 5, max: 5, min: 0 },
      supply: { value: 5, max: 5, min: 0 },
      momentum: { value: 2, max: 10, min: -6, reset: 2 },
    },
    debilities: {
      conditions: { wounded: false, shaken: false, unprepared: false, encumbered: false },
      banes: { maimed: false, corrupted: false },
      burdens: { cursed: false, tormented: false },
    },
    vows: [],
    bonds: NewProgressTrack(),
    gear: '',
    assets: [],
  };
}

describe('applyTrackEffect', () => {
  it('applies a positive delta to the named track', () => {
    const character = newCharacter();
    character.tracks.health.value = 3;
    applyTrackEffect(character, { track: 'health', delta: 2 });
    expect(character.tracks.health.value).toBe(5);
  });

  it('clamps the track value at its max', () => {
    const character = newCharacter();
    applyTrackEffect(character, { track: 'health', delta: 100 });
    expect(character.tracks.health.value).toBe(5);
  });

  it('clamps the track value at its min', () => {
    const character = newCharacter();
    applyTrackEffect(character, { track: 'momentum', delta: -100 });
    expect(character.tracks.momentum.value).toBe(-6);
  });
});
