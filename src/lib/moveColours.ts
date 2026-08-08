// Hex equivalents of the text-positive/text-warning/text-negative classes
// roll.ts's updateResults() assigns to IRollData.action.color and
// challenge.die1/die2.color, for reproducing the on-screen roll-result
// colouring (per action/die, not per move outcome) in journal note HTML.
export const rollResultColours: { [index: string]: string } = {
  'text-positive': '#a3be8c', // $positive -> strong hit
  'text-warning': '#ebcb8b', // $warning  -> weak hit
  'text-negative': '#bf616a', // $negative -> miss
};
