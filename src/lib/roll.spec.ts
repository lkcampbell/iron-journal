import { describe, expect, it, vi } from 'vitest';
import { IOracle } from 'src/components/models';
import { moveRoll, oracleRoll, updateResults } from './roll';

describe('updateResults', () => {
  it('is a strong hit when the action score beats both challenge dice', () => {
    const r = updateResults({
      action: { die: 4, score: 8, color: '' },
      challenge: { die1: { roll: 3, color: '' }, die2: { roll: 5, color: '' }, match: false },
      progress: false,
      result: '',
    });
    expect(r.result).toBe('Strong Hit');
    expect(r.action.color).toBe('text-positive');
    expect(r.challenge.die1.color).toBe('text-positive');
    expect(r.challenge.die2.color).toBe('text-positive');
  });

  it('is a weak hit when the action score beats exactly one challenge die', () => {
    const r = updateResults({
      action: { die: 4, score: 6, color: '' },
      challenge: { die1: { roll: 3, color: '' }, die2: { roll: 8, color: '' }, match: false },
      progress: false,
      result: '',
    });
    expect(r.result).toBe('Weak Hit');
    expect(r.action.color).toBe('text-warning');
    expect(r.challenge.die1.color).toBe('text-positive');
    expect(r.challenge.die2.color).toBe('text-negative');
  });

  it('is a miss when the action score beats neither challenge die', () => {
    const r = updateResults({
      action: { die: 2, score: 2, color: '' },
      challenge: { die1: { roll: 3, color: '' }, die2: { roll: 8, color: '' }, match: false },
      progress: false,
      result: '',
    });
    expect(r.result).toBe('Miss');
    expect(r.action.color).toBe('text-negative');
  });

  it('caps the action score at 10 before comparing to the challenge dice', () => {
    const r = updateResults({
      action: { die: 6, score: 14, color: '' },
      challenge: { die1: { roll: 9, color: '' }, die2: { roll: 8, color: '' }, match: false },
      progress: false,
      result: '',
    });
    expect(r.action.score).toBe(10);
    expect(r.result).toBe('Strong Hit');
  });
});

describe('moveRoll', () => {
  it('sums action die, adds, and attribute for the action score', () => {
    // d(size) = floor(random * size) + 1; call order is d(6), d(10), d(10).
    // Using the bucket midpoint (target - 0.5) / size keeps each value safely
    // away from a floor() boundary for its target result.
    const randoms = [3.5 / 6, 2.5 / 10, 6.5 / 10]; // -> die=4, die1=3, die2=7
    vi.spyOn(Math, 'random').mockImplementation(() => randoms.shift() as number);

    const r = moveRoll(2, 1, 0, false);

    expect(r.action.die).toBe(4);
    expect(r.action.score).toBe(7); // 4 (die) + 1 (adds) + 2 (attr)
    expect(r.challenge.die1.roll).toBe(3);
    expect(r.challenge.die2.roll).toBe(7);
    vi.restoreAllMocks();
  });

  it('subtracts the action die from score when negative momentum matches its value', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.35); // d(6) = 3, d(10) = 4
    const r = moveRoll(2, 0, -3, false);
    // action.score = 3 (die) + 0 (adds) + 2 (attr) = 5, then -3 momentum penalty since |-3| === die(3)
    expect(r.action.score).toBe(2);
    vi.restoreAllMocks();
  });

  it('substitutes progressScore for the action score on a progress move', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const r = moveRoll(2, 1, 0, true, 6);
    expect(r.action.score).toBe(6);
    vi.restoreAllMocks();
  });

  it('flags a match when both challenge dice roll the same value', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.55); // die1 = die2 = 6
    const r = moveRoll(0, 0, 0, false);
    expect(r.challenge.die1.roll).toBe(r.challenge.die2.roll);
    expect(r.challenge.match).toBe(true);
    vi.restoreAllMocks();
  });
});

describe('oracleRoll', () => {
  const oracle: IOracle = {
    name: 'Test Oracle',
    d: 6,
    table: [
      { match: [1, 3], text: 'Low result' },
      { match: [4, 6], text: 'High result' },
    ],
  };

  it('returns the table entry whose range contains the roll', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // d(6) = 1
    expect(oracleRoll(oracle)).toBe('Low result');
    vi.restoreAllMocks();
  });

  it('matches a single-element match array exactly', () => {
    const single: IOracle = { name: 'Single', d: 2, table: [{ match: [2], text: 'Exact' }] };
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // d(2) = 2
    expect(oracleRoll(single)).toBe('Exact');
    vi.restoreAllMocks();
  });

  it('rolls twice and joins results when the entry says "roll twice"', () => {
    const rerollOracle: IOracle = {
      name: 'Reroll',
      d: 2,
      table: [
        { match: [1, 1], text: 'Roll twice' },
        { match: [2, 2], text: 'Second' },
      ],
    };
    const rolls = [0, 0.9, 0.9]; // first roll -> 1 (roll twice), then 2, 2
    vi.spyOn(Math, 'random').mockImplementation(() => rolls.shift() as number);
    expect(oracleRoll(rerollOracle)).toBe('Second, Second');
    vi.restoreAllMocks();
  });
});
